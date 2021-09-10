export const compareEntries = () => {
  return (a: any, b: any) => a[0].localeCompare(b[0]);
};

export const compareField = (field: string) => {
  return (a: any, b: any) => a[field].localeCompare(b[field]);
};

export const groupBy = <T, K extends keyof T>(array: T[], field: K): [string, T[]][] => {
  const entries = Object.entries(
    array.reduce((acc: { [key: string]: T[] }, item) => {
      if (Object.prototype.hasOwnProperty.call(item, field) && item[field]) {
        return {
          ...acc,
          // @ts-ignore
          [item[field] as unknown as string]: [...(acc[item[field]] ?? []), item],
        };
      }
      return { ...acc, '': [...(acc[''] ?? []), item] };
    }, {})
  );

  return entries.sort(compareEntries());
};
