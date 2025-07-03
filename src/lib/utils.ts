import { Temporal } from "@js-temporal/polyfill";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import tinycolor from "tinycolor2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateColorShades(hexColor: string): string[] {
  const baseColor = tinycolor(hexColor);
  if (!baseColor.isValid()) {
    return ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  }

  const shades = [
    tinycolor("#ebedf0").toHexString(),
    baseColor.lighten(20).toHexString(),
    baseColor.lighten(10).toHexString(),
    baseColor.toHexString(),
    baseColor.darken(10).toHexString(),
  ];

  return shades;
}

export function generateDateRange({
  first,
  last,
  withWeekPadding,
}: {
  first: Temporal.PlainDate;
  last: Temporal.PlainDate;
  withWeekPadding?: boolean;
}) {
  const startDate = first.subtract({
    days: withWeekPadding ? first.dayOfWeek - 1 : 0,
  });

  const endDate = last.add({
    days: withWeekPadding ? 7 - last.dayOfWeek + 2 : 0,
  });

  const dates = Array.from<Temporal.PlainDate>({
    length: startDate.until(endDate).days - 1,
  })
    .fill(Temporal.PlainDate.from(startDate))
    .map((date, i) => date.add({ days: i }));

  return {
    dates,
    startDate: startDate.toString(),
    endDate: endDate.toString(),
  };
}
