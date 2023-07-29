// map if x is not undefined
export const maybe = <T, U>(f: (x: T) => U, x?: T): U | undefined => {
	if (x !== undefined) {
		return f(x);
	}
};
