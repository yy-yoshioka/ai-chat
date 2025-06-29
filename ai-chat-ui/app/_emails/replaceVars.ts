/**
 * {{key}} 形式のプレースホルダー置換
 * 任意の型 T を受け取れるようジェネリックにする
 */
export function replaceEmailVariables<T extends object>(template: string, data: T): string {
  return Object.entries(data as Record<string, string | number>).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
    template
  );
}
