export function var_dump(object: any): string {
    return new ObjectDumper(object).invoke().toString();
}

class ObjectDumper {
    private text: StringBuilder;
    private raw: any;

    constructor(raw: any) {
        this.text = new StringBuilder();
        this.raw = raw;
    }

    invoke() {
        this._dumpAutodetect(this.raw);
        return this;
    }

    private _dumpAutodetect(input: any) {
        if (Array.isArray(input)) {
            if (typeof input == 'string')
                return this._dumpObject(input);
            else
                this._dumpArray(<any[]>input);
        }
        else {
            this.text.append('{\n')
                .tab()
                .indent();

            this._dumpObject(input);

            this.text
                .unindent()
                .append('}');
        }
    }

    private _dumpArray(e: Array<any>, key?: string) {
        this.text.tab()
            .append(`${(key || '')}`)
            .append(key ? ' ' : '')
            .append(`array(size=${e.length}):`)
            .append('\n')

            .tab()
            .append('{')
            .indent()
            .append('\n');

        for (let index in e) {
            let value = e[index];

            if (Array.isArray(value) && typeof value != 'string') {
                this._dumpArray(<any[]>value, `${index}:`);
            }
            else if (typeof value == 'object') {
                this._dumpObject(value, `#${index}: `);
            }
            else {
                this.text.tab()
                    .append(`[${index}]: `)
                    .append(value)
                    .append(',')
                    .append('\n');
            }
        }

        this.text
            .unindent()
            .tab()
            .append('}');

        if (this.text.depth > 0)
            this.text.append('\n');
    }

    private _dumpString(str: string, key?: string) {
        this.text
            .tab();

        if (key && key.length)
            this.text.append(key).append(': ');

        this.text.append(`"${str}" string(${str.length})`)
            .append('\n');
    }

    private _dumpObject(obj: any, fieldName?: string) {
        if (typeof obj == 'string') {
            this._dumpString(obj);
            return;
        }

        this.text.tab();

        if (fieldName)
            this.text.append(fieldName).append('\n');

        this.text.tab().append('{\n').indent();

        let keys = Object.keys(obj);

        for (let key of keys) {
            let value = obj[key];

            if (Array.isArray(value) && typeof value != 'string')
                this._dumpArray(<any[]>value, key + ':');
            else if (typeof value == 'object') {
                this.text.tab().append(key).append(': ');

                if (value == null)
                    this.text.append('<null>');
                else if (value == obj)
                    this.text.append('<circular reference>');
                else {
                    this._dumpAutodetect(value);
                }

                this.text.append('\n');
            }
            else {
                let manual = false;
                let val = value;

                if (typeof value == 'boolean') {
                    val = value ? 'true' : 'false';
                }
                else if (typeof value == 'string') {
                    this._dumpString(value, key);
                    manual = true;
                }
                else {
                    val = value;
                }

                if (!manual) {
                    this.text
                        .tab()
                        .append(key)
                        .append(': ')
                        .append(val)
                        .append('\n');
                }
            }
        }

        this.text.unindent().tab().append('}');

        if (this.text.depth > 0)
            this.text.append(',').append('\n').append('\n');
    }


    toString() {
        return this.text.toString();
    }
}

class StringBuilder {
    private _str: string = '';
    private _count = 0;

    public append(value: string) {
        this._str += value;
        return this;
    }

    public tab() {
        this._str += this.prefix;
        return this;
    }

    get prefix() {
        if (this._count <= 0)
            return '';

        return '  '.repeat(this._count);
    }

    get depth() {
        return this._count;
    }

    public toString(): string {
        return this._str;
    }

    public indent() {
        this._count++;
        return this;
    }

    public unindent() {
        this._count--;

        if (this._count < 0)
            this._count = 0;

        return this;
    }
}
