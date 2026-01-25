import asyncio
import base64
import json
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv
from githubkit import GitHub


@dataclass
class Course:
    code: str
    name: str


@dataclass
class Plan:
    id: str
    year: str
    major_code: str
    major_name: str
    courses: list[Course] = field(default_factory=list)


async def run_hoa(*args: str, sem: asyncio.Semaphore | None = None) -> list[str]:
    """Helper to run 'hoa' CLI commands and return output lines."""
    async with (sem or asyncio.Lock()):
        proc = await asyncio.create_subprocess_exec(
            "hoa", *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, _ = await proc.communicate()
        return stdout.decode().splitlines()


async def fetch_readme(
    github: GitHub, repo: str, sem: asyncio.Semaphore | None = None
) -> str:
    """Fetch README from GitHub and cache it locally in 'repos/'."""
    path = Path("repos") / f"{repo}.mdx"
    if not path.exists():
        try:
            async with (sem or asyncio.Lock()):
                resp = await github.rest.repos.async_get_content(
                    "HITSZ-OpenAuto", repo, "README.md"
                )
            encoded = getattr(resp.parsed_data, "content", "").replace("\n", "")
            path.write_text(base64.b64decode(encoded).decode("utf-8"))
        except Exception as e:
            print(f"Error fetching {repo}: {e}")
            return ""
    return path.read_text()


async def update_plan(
    plan: Plan, repos_set: set[str], sem: asyncio.Semaphore | None = None
) -> None:
    """Fetch courses for a specific plan and filter by existing repos."""
    lines = await run_hoa("courses", plan.id, sem=sem)
    for line in lines:
        parts = line.split()
        if len(parts) >= 2 and parts[0] in repos_set:
            plan.courses.append(Course(parts[0], parts[1]))


async def generate_pages(plans: list[Plan]) -> None:
    """Generate course pages and metadata from plans."""
    print("Generating pages...")
    years = set()
    repos_dir = Path("repos")
    docs_dir = Path("content/docs")
    for plan in plans:
        years.add(plan.year)
        major_dir = docs_dir / plan.year / plan.major_code
        major_dir.mkdir(parents=True, exist_ok=True)

        # Write major metadata
        (major_dir / "meta.json").write_text(
            json.dumps(
                {"title": plan.major_name, "root": True, "defaultOpen": True},
                indent=2,
                ensure_ascii=False,
            )
        )

        # Generate course pages
        for course in plan.courses:
            path = repos_dir / f"{course.code}.mdx"
            if path.exists():
                content = path.read_text()
                (major_dir / f"{course.code}.mdx").write_text(
                    f"---\ntitle: {course.name}\n---\n\n{content}"
                )

    # Write year metadata once per year
    for year in years:
        meta_path = docs_dir / year / "meta.json"
        meta_path.write_text(json.dumps({"title": year}, indent=2))


async def main() -> None:
    load_dotenv()
    token = os.environ.get("PERSONAL_ACCESS_TOKEN")
    if not token:
        sys.exit("Error: PERSONAL_ACCESS_TOKEN environment variable is required.")

    github = GitHub(token)
    Path("repos").mkdir(exist_ok=True)

    repos_list = {
        line.strip()
        for line in Path("repos_list.txt").read_text().splitlines()
        if line.strip()
    }

    hoa_sem = asyncio.Semaphore(20)
    github_sem = asyncio.Semaphore(20)

    print("Reading plans...")
    plans = []
    for line in await run_hoa("plans", sem=hoa_sem):
        p = line.split()
        if len(p) >= 4:
            plans.append(Plan(id=p[0], year=p[1], major_code=p[2], major_name=p[3]))

    print(
        f"Fetching courses for {len(plans)} plans and "
        f"READMEs for {len(repos_list)} repos..."
    )
    await asyncio.gather(
        *(update_plan(p, repos_list, sem=hoa_sem) for p in plans),
        *(fetch_readme(github, r, sem=github_sem) for r in repos_list),
    )

    await generate_pages(plans)

    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
