import type { ReactNode } from 'react';

// File tree types
export interface FileNode {
  id: string; // Full path as unique ID
  name: string;
  type: 'file' | 'folder';
  url?: string;
  size?: number;
  date?: string;
  fileType?: string;
  depth: number; // For indentation
  children?: FileNode[];
  defaultOpen?: boolean;
}

export interface FileProps {
  name: string;
  url?: string;
  size?: number;
  date?: string;
  type?: string;
}

export interface FolderProps {
  name: string;
  children?: ReactNode;
  defaultOpen?: boolean | string;
  date?: string;
  size?: number;
}

export interface DownloadFile {
  path: string;
  url: string;
  name: string;
}

// Course info types
export type CourseHourDistribution = {
  theory: number;
  lab: number;
  practice: number;
  exercise: number;
  computer: number;
  tutoring: number;
};

export type CourseGradingScheme = {
  classParticipation: number;
  homeworkAssignments: number;
  laboratoryWork: number;
  finalExamination: number;
};

export type CourseInfoData = {
  credit: number;
  assessmentMethod: string;
  courseNature: string;
  hourDistribution: CourseHourDistribution;
  gradingScheme: CourseGradingScheme;
};
