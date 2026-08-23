type QueueEntry<T> = {
  execute: () => Promise<T>;
  resolve: (res: T) => void;
  reject: (err: unknown) => void;
};

export class ThrottledQueue<T = unknown> {
  private readonly intervalMs: number;
  private readonly maxQueueSize: number;
  private readonly queue: QueueEntry<T>[] = [];
  private processing = false;

  constructor(intervalMs = 1000, maxQueueSize = 10) {
    this.intervalMs = intervalMs;
    this.maxQueueSize = maxQueueSize;
  }

  get pending(): number {
    return this.queue.length;
  }

  get isFull(): boolean {
    return this.queue.length >= this.maxQueueSize;
  }

  enqueue(execute: () => Promise<T>): Promise<T> {
    if (this.isFull) {
      throw new ThrottleOverflowError(this.queue.length, this.intervalMs);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ execute, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const entry = this.queue.shift()!;
      try {
        const res = await entry.execute();
        entry.resolve(res);
      } catch (err) {
        entry.reject(err);
      }
      if (this.queue.length > 0) {
        await new Promise((r) => setTimeout(r, this.intervalMs));
      }
    }

    this.processing = false;
  }
}

export class ThrottleOverflowError extends Error {
  readonly retryAfterSecs: number;

  constructor(pending: number, intervalMs: number) {
    const retryAfter = pending * (intervalMs / 1000);
    super(`Queue full (${pending} pending). Retry after ${retryAfter}s.`);
    this.name = "ThrottleOverflowError";
    this.retryAfterSecs = retryAfter;
  }
}
