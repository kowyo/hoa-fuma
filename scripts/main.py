import asyncio
import os
import subprocess
import json

from pathlib import Path
from github import Auth, Github

access_token = str(os.environ.get("PERSONAL_ACCESS_TOKEN"))
auth = Auth.Token(token=access_token)
g = Github(auth=auth)


class Course:
    def __init__(self, course_code, course_name):
        self.course_code: str = course_code
        self.course_name: str = course_name


class Plan:
    def __init__(self, plan_id, major_code, major_name, plan_year, plan_courses):
        self.plan_id = plan_id
        self.major_code = major_code
        self.major_name = major_name
        self.plan_year: str = plan_year
        self.plan_courses: list[Course] = plan_courses


def create_plan_dir(plan: Plan):
    plan_dir = Path(f"content/docs/{plan.plan_year}/{plan.major_code}")
    plan_dir.mkdir(parents=True, exist_ok=True)


async def update_plan_course(plan: Plan, repos_list):
    # print(f"Listing plan {p.plan_id}'s courses...")
    courses: list[str] = str(
        subprocess.run(
            args=f"hoa courses {plan.plan_id}",
            shell=True,
            capture_output=True,
            text=True,
        ).stdout
    ).splitlines()

    new_courses = [c.split() for c in courses]

    for course in new_courses:
        if course[0] in repos_list:
            plan.plan_courses.append(
                Course(course_code=course[0], course_name=course[1])
            )


def create_course_page(plan: Plan):
    for c in plan.plan_courses:
        course_path = Path(
            f"content/docs/{plan.plan_year}/{plan.major_code}/{c.course_code}.mdx"
        )

        source_path = Path(f"repos/{c.course_code}.mdx")

        with open(file=source_path, mode="r") as f:
            source_content = f.read()

        with open(file=f"{course_path}", mode="w") as f:
            s: str = ""
            s += "---\n"
            s += f"title: {c.course_name}\n"
            s += "---\n\n"
            s += source_content
            f.write(s)


def fetch_repo_readme(owner, repo):
    p = Path("repos")
    file_path = p / f"{repo}.mdx"
    if not file_path.exists():
        print(f"Fetching {repo}...")
        gh_repo = g.get_repo(f"{owner}/{repo}")
        contents = gh_repo.get_contents("README.md", ref="main")
        content = contents.decoded_content.decode("utf-8")
        with file_path.open(mode="w") as f:
            f.write(content)


def create_metadata(plan: Plan):
    year_path = Path(f"content/docs/{plan.plan_year}/meta.json")
    with open(file=year_path, mode="w") as f:
        year_info: dict = {"title": f"{plan.plan_year}"}
        json.dump(year_info, f)

    major_path = Path(f"content/docs/{plan.plan_year}/{plan.major_code}/meta.json")
    with open(file=major_path, mode="w", encoding="utf-8") as f:
        major_info: dict = {
            "title": f"{plan.major_name}",
            "root": "true",
            "defaultOpen": "true",
        }
        json.dump(obj=major_info, fp=f, ensure_ascii=False)


def main():
    docs_dir = Path("content/docs")
    docs_dir.mkdir(parents=True, exist_ok=True)

    repos_dir = Path("repos")
    repos_dir.mkdir(exist_ok=True)

    repos_list: list[str] = []

    print("Reading exsiting repos")
    with open(file="repos_list.txt") as f:
        for x in f:
            repos_list.append(str(x).strip())

    plans: list[Plan] = []
    plans_list = str(
        subprocess.run(
            args="hoa plans",
            shell=True,
            capture_output=True,
            text=True,
        ).stdout
    ).splitlines()

    for i in plans_list:
        plan_id, plan_year, major_code, major_name = i.split()
        plans.append(
            Plan(
                plan_id=plan_id,
                major_code=major_code,
                major_name=major_name,
                plan_year=plan_year,
                plan_courses=[],
            )
        )

    print("Adding courses..")
    for idx, p in enumerate(plans):
        asyncio.run(main=update_plan_course(p, repos_list))

    print("Creating dirs...")
    for idx, p in enumerate(plans):
        create_plan_dir(plan=p)

    print("Downloading repo pages...")
    for idx, repo_id in enumerate(repos_list):
        fetch_repo_readme(owner="HITSZ-OpenAuto", repo=repo_id)

    print("Creating course pages...")
    for idx, p in enumerate(plans):
        create_course_page(plan=p)

    print("Creating meta.json...")
    for idx, p in enumerate(plans):
        create_metadata(plan=p)


if __name__ == "__main__":
    main()
