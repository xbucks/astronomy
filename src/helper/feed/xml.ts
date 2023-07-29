const escapeAttribute = (input: string) =>
	input.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

const escapeText = (input: string) =>
	input.replaceAll("&", "&amp;").replaceAll("<", "&lt;");

const escapeCdata = (input: string) =>
	input.replaceAll("]]>", "]]]]><![CDATA[>");

// XML element builder interface
export interface Element {
	tag: string;
	attributes: Map<string, string>;
	value?: string;

	attr(key: string, value?: string): this;
	text(text?: string): this;
	cdata(cdata?: string): this;
	push(...items: Push[]): this;
	render(): string;
}

export type Push = undefined | Element | Push[];

export const el = (tag: string): Element => ({
	tag,
	attributes: new Map(),

	attr(key: string, value?: string) {
		if (value !== undefined) {
			this.attributes.set(key, escapeAttribute(value));
		}
		return this;
	},

	text(text?: string) {
		if (text !== undefined) {
			this.value ??= "";
			this.value += escapeText(text);
		}
		return this;
	},

	cdata(cdata?: string) {
		if (cdata !== undefined) {
			this.value ??= "";
			this.value += `<![CDATA[${escapeCdata(cdata)}]]>`;
		}
		return this;
	},

	push(...items: Push[]) {
		for (const item of items) {
			if (Array.isArray(item)) {
				for (const meti of item) {
					this.push(meti);
				}
			} else if (item) {
				this.value ??= "";
				this.value += item.render();
			}
		}
		return this;
	},

	render() {
		const space = this.attributes.size > 0 ? " " : "";
		const attributes = Array.from(this.attributes.entries())
			.map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
			.join(" ");
		return this.value !== undefined
			? `<${this.tag}${space}${attributes}>${this.value}</${this.tag}>`
			: `<${this.tag}${space}${attributes}/>`;
	},
});
