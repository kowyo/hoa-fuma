import type { ReactNode, ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';
import type { CourseInfoData } from '@/lib/types';
import {
  GraduationCap,
  Tag,
  ClipboardCheck,
  BookOpen,
  Beaker,
  UserCheck,
  PencilLine,
  Monitor,
  Users,
  Clock,
  Info,
  Award,
} from 'lucide-react';

type CourseInfoProps = {
  data?: CourseInfoData;
  className?: string;
};

function formatCredit(credit: number) {
  return Number.isInteger(credit) ? credit.toFixed(1) : credit.toString();
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-muted-foreground flex items-center gap-2 text-sm">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function CourseInfo({ data, className }: CourseInfoProps) {
  if (!data) {
    return (
      <div
        className={cn(
          'not-prose text-muted-foreground rounded-lg border border-dashed p-4 text-sm',
          className
        )}
      >
        课程信息缺失。
      </div>
    );
  }

  return (
    <section
      className={cn(
        'not-prose bg-card/50 overflow-hidden rounded-lg border',
        className
      )}
    >
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Info className="size-4 text-blue-500" />
            基本信息
          </h4>
          <dl className="flex flex-wrap items-start gap-4">
            <InfoItem
              label="学分"
              icon={GraduationCap}
              value={formatCredit(data.credit)}
            />
            <InfoItem label="课程性质" icon={Tag} value={data.courseNature} />
            <InfoItem
              label="考核方式"
              icon={ClipboardCheck}
              value={data.assessmentMethod}
            />
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t pt-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4 text-orange-500" />
            学时分配
          </h4>
          <dl className="flex flex-wrap items-start gap-4">
            {data.hourDistribution.theory > 0 && (
              <InfoItem
                label="理论"
                icon={BookOpen}
                value={`${data.hourDistribution.theory} 学时`}
              />
            )}
            {data.hourDistribution.lab > 0 && (
              <InfoItem
                label="实验"
                icon={Beaker}
                value={`${data.hourDistribution.lab} 学时`}
              />
            )}
            {data.hourDistribution.practice > 0 && (
              <InfoItem
                label="实践"
                icon={UserCheck}
                value={`${data.hourDistribution.practice} 学时`}
              />
            )}
            {data.hourDistribution.exercise > 0 && (
              <InfoItem
                label="习题"
                icon={PencilLine}
                value={`${data.hourDistribution.exercise} 学时`}
              />
            )}
            {data.hourDistribution.computer > 0 && (
              <InfoItem
                label="上机"
                icon={Monitor}
                value={`${data.hourDistribution.computer} 学时`}
              />
            )}
            {data.hourDistribution.tutoring > 0 && (
              <InfoItem
                label="辅导"
                icon={Users}
                value={`${data.hourDistribution.tutoring} 学时`}
              />
            )}
          </dl>
        </div>

        <div className="border-t pt-4">
          <div className="mb-3 flex items-center gap-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Award className="size-4 text-yellow-500" />
              成绩构成
            </h4>
          </div>
          <div className="flex w-full" style={{ gap: '1px' }}>
            {data.gradingScheme.classParticipation > 0 && (
              <div
                style={{ width: `${data.gradingScheme.classParticipation}%` }}
              >
                <div className="text-muted-foreground mb-1 truncate text-xs">
                  平时表现
                </div>
                <div
                  className="flex h-4 items-center justify-center bg-emerald-200 text-xs font-medium text-emerald-700"
                  title={`平时表现 ${data.gradingScheme.classParticipation}%`}
                >
                  {data.gradingScheme.classParticipation >= 10 &&
                    `${data.gradingScheme.classParticipation}%`}
                </div>
              </div>
            )}
            {data.gradingScheme.homeworkAssignments > 0 && (
              <div
                style={{ width: `${data.gradingScheme.homeworkAssignments}%` }}
              >
                <div className="text-muted-foreground mb-1 truncate text-xs">
                  平时作业
                </div>
                <div
                  className="flex h-4 items-center justify-center bg-blue-200 text-xs font-medium text-blue-700"
                  title={`平时作业 ${data.gradingScheme.homeworkAssignments}%`}
                >
                  {data.gradingScheme.homeworkAssignments >= 10 &&
                    `${data.gradingScheme.homeworkAssignments}%`}
                </div>
              </div>
            )}
            {data.gradingScheme.laboratoryWork > 0 && (
              <div style={{ width: `${data.gradingScheme.laboratoryWork}%` }}>
                <div className="text-muted-foreground mb-1 truncate text-xs">
                  实验成绩
                </div>
                <div
                  className="flex h-4 items-center justify-center bg-purple-200 text-xs font-medium text-purple-700"
                  title={`实验成绩 ${data.gradingScheme.laboratoryWork}%`}
                >
                  {data.gradingScheme.laboratoryWork >= 10 &&
                    `${data.gradingScheme.laboratoryWork}%`}
                </div>
              </div>
            )}
            {data.gradingScheme.finalExamination > 0 && (
              <div style={{ width: `${data.gradingScheme.finalExamination}%` }}>
                <div className="text-muted-foreground mb-1 truncate text-xs">
                  期末考试
                </div>
                <div
                  className="flex h-4 items-center justify-center bg-amber-200 text-xs font-medium text-amber-700"
                  title={`期末考试 ${data.gradingScheme.finalExamination}%`}
                >
                  {data.gradingScheme.finalExamination >= 10 &&
                    `${data.gradingScheme.finalExamination}%`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
