import mongoose from 'mongoose';

export const TASK_STATUSES = [
  'Pending',
  'Running',
  'Completed',
  'Failed',
  'Blocked',
];

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters.'],
      maxlength: [160, 'Task title cannot exceed 160 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
      default: '',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'Medium',
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative.'],
      default: 0,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Pending',
      index: true,
    },
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    resourceTag: {
      type: String,
      trim: true,
      maxlength: [80, 'Resource tag cannot exceed 80 characters.'],
      default: '',
    },
    maxRetries: {
      type: Number,
      min: [0, 'Max retries cannot be negative.'],
      default: 0,
    },
    retryCount: {
      type: Number,
      min: [0, 'Retry count cannot be negative.'],
      default: 0,
    },
    versionNumber: {
      type: Number,
      min: [1, 'Version number must be at least 1.'],
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
