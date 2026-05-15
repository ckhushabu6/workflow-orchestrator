import mongoose from 'mongoose';

const taskVersionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    snapshot: {
      title: String,
      description: String,
      priority: String,
      estimatedHours: Number,
      status: String,
      dependencies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
      ],
      resourceTag: String,
      maxRetries: Number,
      retryCount: Number,
      versionNumber: Number,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

taskVersionSchema.index({ task: 1, versionNumber: -1 });

const TaskVersion = mongoose.model('TaskVersion', taskVersionSchema);

export default TaskVersion;
