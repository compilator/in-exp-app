export function qs<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T | null {
  return root.querySelector(selector) as T | null;
}

export function qsa<T extends HTMLElement = HTMLElement>(selector: string): T[] {
  return [...document.querySelectorAll(selector)] as T[];
}

export function replaceFormElement(form: HTMLFormElement): HTMLFormElement {
  const newForm = form.cloneNode(true) as HTMLFormElement;
  form.parentNode?.replaceChild(newForm, form);
  return newForm;
}

export function getOperationFormValues() {
  return {
    type: qs<HTMLInputElement>('#type')?.value ?? '',
    category_id: parseInt(qs<HTMLSelectElement>('#category')?.value ?? '0', 10),
    amount: parseFloat(qs<HTMLInputElement>('#amount')?.value ?? '0'),
    date: qs<HTMLInputElement>('#date')?.value ?? '',
    comment: qs<HTMLInputElement>('#comment')?.value ?? '',
  };
}
