/**
 * This decorator caches a getter and makes sure
 * it is only computed once.
 *
 * @param target
 * @param {string} key
 * @param {PropertyDescriptor} descriptor
 */
export function cachedProperty (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalGetter = descriptor.get;
    descriptor.get = function () {
        const hasCached = this[`__cachedSet${key}`];
        if (typeof hasCached !== 'undefined') {
            return this[`__cached${key}`];
        }
        this[`__cachedSet${key}`] = true;

        return this[`__cached${key}`] = originalGetter.call(this);
    };
}