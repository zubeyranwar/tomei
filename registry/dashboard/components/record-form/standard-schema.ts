import type { FormErrors, FormValues } from './schema'

type PathSegment = PropertyKey | { readonly key: PropertyKey }

type StandardIssue = { readonly message: string; readonly path?: ReadonlyArray<PathSegment> }

type StandardResult =
  | { readonly value: unknown; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> }

export type StandardSchema = {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult | Promise<StandardResult>
  }
}

export type Resolver = (values: FormValues) => FormErrors | Promise<FormErrors>

export const FORM_ERROR = '_form'

export function issuesToErrors(issues: ReadonlyArray<StandardIssue>): FormErrors {
  const errors: FormErrors = {}
  for (const issue of issues) {
    const key =
      issue.path
        ?.map((p) => String(typeof p === 'object' && p !== null && 'key' in p ? p.key : p))
        .join('.') || FORM_ERROR
    errors[key] ??= issue.message
  }
  return errors
}

export function standardSchema(schema: StandardSchema): Resolver {
  return (values) => {
    const result = schema['~standard'].validate(values)
    const read = (r: StandardResult) => (r.issues ? issuesToErrors(r.issues) : {})
    return result instanceof Promise ? result.then(read) : read(result)
  }
}
