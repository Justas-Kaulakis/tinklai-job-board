export type FieldErrors<T extends string> = Partial<Record<T, string[]>>;

export type FormState<TFields extends string = never> = {
    ok: boolean;
    formError?: string;
    fieldErrors?: FieldErrors<TFields>;
    message?: string;
};
