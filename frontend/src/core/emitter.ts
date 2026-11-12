type Handler = (data: any) => void;

export class EventEmitter {
    private readonly handlers = new Map<string, Set<Handler>>();

    on(event: string, handler: Handler): this {
        let set = this.handlers.get(event);

        if (!set) {
            set = new Set();
            this.handlers.set(event, set);
        }

        set.add(handler);

        return this;
    }

    off(event: string, handler: Handler): this {
        this.handlers.get(event)?.delete(handler);

        return this;
    }

    emit(event: string, data?: unknown): boolean {
        const set = this.handlers.get(event);

        if (!set || set.size === 0) {
            return false;
        }

        for (const handler of [...set]) {
            handler(data);
        }

        return true;
    }

    removeAllListeners(): this {
        this.handlers.clear();

        return this;
    }
}
