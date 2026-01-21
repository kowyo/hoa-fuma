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
  Smile,
  ScrollText,
  FileText,
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

function formatPercent(value: number) {
  return `${value}%`;
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
        <Icon className="size-3.5" />
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

        <div className="flex flex-wrap items-center gap-4 border-t pt-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Award className="size-4 text-yellow-500" />
            成绩构成
          </h4>
          <dl className="flex flex-wrap items-start gap-4">
            {data.gradingScheme.classParticipation > 0 && (
              <InfoItem
                label="平时表现"
                icon={Smile}
                value={formatPercent(data.gradingScheme.classParticipation)}
              />
            )}
            {data.gradingScheme.homeworkAssignments > 0 && (
              <InfoItem
                label="平时作业"
                icon={ScrollText}
                value={formatPercent(data.gradingScheme.homeworkAssignments)}
              />
            )}
            {data.gradingScheme.laboratoryWork > 0 && (
              <InfoItem
                label="实验成绩"
                icon={Beaker}
                value={formatPercent(data.gradingScheme.laboratoryWork)}
              />
            )}
            {data.gradingScheme.finalExamination > 0 && (
              <InfoItem
                label="期末考试"
                icon={FileText}
                value={formatPercent(data.gradingScheme.finalExamination)}
              />
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
