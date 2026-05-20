export interface CalculatorState {
  itemsPerPlate: number;
  totalItems: number;
  hours: number;
  minutes: number;
  power: number;
  energyPrice: number;
  weight: number;
  filamentPrice: number;
  wearEnabled: boolean;
  printerPrice: number;
  printerLife: number;
  profitMargin: number;
  taxRate: number;
  setupFee: number;
}

export type AppLang = 'en' | 'de';

export interface ProjectState {
  name: string;
  customer: string;
  status: 'draft' | 'quoted' | 'in-progress' | 'done';
  note: string;
}

export interface CalculatorResults {
  plateHours: number;
  energyTotalPlate: number;
  materialTotalPlate: number;
  wearTotalPlate: number;
  totalCostPlate: number;
  costPerItem: number;
  materialPerItem: number;
  energyPerItem: number;
  wearPerItem: number;
  weightPerItem: number;
  timePerItem: number;
  orderTotalCost: number;
  orderTotalWeight: number;
  orderTotalTime: number;
  netProductionCost: number;
  profitAmount: number;
  netTotal: number;
  taxAmount: number;
  grossTotal: number;
  grossPerItem: number;
  markupTotal: number;
}

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const currencyFormatterEn = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
});

const statusLabels: Record<AppLang, Record<ProjectState['status'], string>> = {
  de: {
    draft: 'Entwurf',
    quoted: 'Angeboten',
    'in-progress': 'In Arbeit',
    done: 'Fertig',
  },
  en: {
    draft: 'Draft',
    quoted: 'Quoted',
    'in-progress': 'In progress',
    done: 'Done',
  },
};

export const defaultState: CalculatorState = {
  itemsPerPlate: 4,
  totalItems: 50,
  hours: 8,
  minutes: 30,
  power: 100,
  energyPrice: 0.35,
  weight: 89,
  filamentPrice: 22,
  wearEnabled: false,
  printerPrice: 750,
  printerLife: 2000,
  profitMargin: 100,
  taxRate: 19,
  setupFee: 10,
};

export function formatCurrency(value: number): string {
  return formatCurrencyByLang(value, 'de');
}

export function formatCurrencyByLang(value: number, lang: AppLang): string {
  return (lang === 'de' ? currencyFormatter : currencyFormatterEn).format(value);
}

export function formatWeight(grams: number, lang: AppLang = 'de'): string {
  if (grams >= 1000) {
    const value = (grams / 1000).toFixed(2).replace('.', lang === 'de' ? ',' : '.');
    return `${value} kg`;
  }

  return `${Math.round(grams)} g`;
}

export function formatTime(totalHours: number, lang: AppLang = 'de'): string {
  const clampedHours = Math.max(0, totalHours);
  const roundedMinutes = Math.round((clampedHours - Math.floor(clampedHours)) * 60);
  const normalizedHours = Math.floor(clampedHours) + Math.floor(roundedMinutes / 60);
  const normalizedMinutes = roundedMinutes % 60;

  return lang === 'de'
    ? `${normalizedHours}h ${normalizedMinutes}m`
    : `${normalizedHours}h ${normalizedMinutes}m`;
}

export function formatQuoteDate(timestamp: number, lang: AppLang): string {
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function calculateQuote(state: CalculatorState): CalculatorResults {
  const itemsPerPlate = Math.max(state.itemsPerPlate, 1);
  const totalItems = Math.max(state.totalItems, 0);
  const printerLife = Math.max(state.printerLife, 1);

  const plateHours = Math.max(0, state.hours) + Math.max(0, state.minutes) / 60;
  const powerKilowatts = Math.max(0, state.power) / 1000;

  const energyTotalPlate = plateHours * powerKilowatts * Math.max(0, state.energyPrice);
  const materialTotalPlate = (Math.max(0, state.weight) / 1000) * Math.max(0, state.filamentPrice);
  const wearTotalPlate = state.wearEnabled
    ? (Math.max(0, state.printerPrice) / printerLife) * plateHours
    : 0;

  const totalCostPlate = energyTotalPlate + materialTotalPlate + wearTotalPlate;
  const costPerItem = totalCostPlate / itemsPerPlate;
  const materialPerItem = materialTotalPlate / itemsPerPlate;
  const energyPerItem = energyTotalPlate / itemsPerPlate;
  const wearPerItem = wearTotalPlate / itemsPerPlate;
  const weightPerItem = Math.max(0, state.weight) / itemsPerPlate;
  const timePerItem = plateHours / itemsPerPlate;

  const orderTotalCost = costPerItem * totalItems;
  const orderTotalWeight = weightPerItem * totalItems;
  const orderTotalTime = timePerItem * totalItems;

  const profitAmount = orderTotalCost * (Math.max(0, state.profitMargin) / 100);
  const netProductionCost = orderTotalCost;
  const netTotal = netProductionCost + profitAmount + Math.max(0, state.setupFee);
  const taxAmount = netTotal * (Math.max(0, state.taxRate) / 100);
  const grossTotal = netTotal + taxAmount;
  const grossPerItem = totalItems > 0 ? grossTotal / totalItems : 0;
  const markupTotal = profitAmount + Math.max(0, state.setupFee);

  return {
    plateHours,
    energyTotalPlate,
    materialTotalPlate,
    wearTotalPlate,
    totalCostPlate,
    costPerItem,
    materialPerItem,
    energyPerItem,
    wearPerItem,
    weightPerItem,
    timePerItem,
    orderTotalCost,
    orderTotalWeight,
    orderTotalTime,
    netProductionCost,
    profitAmount,
    netTotal,
    taxAmount,
    grossTotal,
    grossPerItem,
    markupTotal,
  };
}

export function solvePrinterPriceForTargetGrossPerItem(
  state: CalculatorState,
  targetGrossPerItem: number,
): number | null {
  const itemsPerPlate = Math.max(state.itemsPerPlate, 1);
  const totalItems = Math.max(state.totalItems, 0);
  const printerLife = Math.max(state.printerLife, 1);
  const taxFactor = 1 + Math.max(0, state.taxRate) / 100;
  const marginFactor = 1 + Math.max(0, state.profitMargin) / 100;
  const setupFee = Math.max(0, state.setupFee);
  const plateHours = Math.max(0, state.hours) + Math.max(0, state.minutes) / 60;

  if (targetGrossPerItem < 0 || totalItems <= 0 || plateHours <= 0 || taxFactor <= 0 || marginFactor <= 0) {
    return null;
  }

  const powerKilowatts = Math.max(0, state.power) / 1000;
  const energyTotalPlate = plateHours * powerKilowatts * Math.max(0, state.energyPrice);
  const materialTotalPlate = (Math.max(0, state.weight) / 1000) * Math.max(0, state.filamentPrice);
  const baseCostPerItem = (energyTotalPlate + materialTotalPlate) / itemsPerPlate;

  const requiredCostPerItem = (targetGrossPerItem / taxFactor - setupFee / totalItems) / marginFactor;
  const requiredWearPerItem = requiredCostPerItem - baseCostPerItem;

  if (requiredWearPerItem < 0) {
    return null;
  }

  const requiredWearPerPlate = requiredWearPerItem * itemsPerPlate;
  const printerPrice = (requiredWearPerPlate / plateHours) * printerLife;

  if (!Number.isFinite(printerPrice) || printerPrice < 0) {
    return null;
  }

  return printerPrice;
}

export function buildQuoteText(
  state: CalculatorState,
  results: CalculatorResults,
  lang: AppLang = 'de',
  project?: ProjectState,
): string {
  const copy =
    lang === 'de'
      ? {
          hello: 'Hallo!',
          intro: 'Hier ist dein Angebot für den 3D-Druck Auftrag:',
          qty: 'Menge',
          time: 'Geschätzte Produktionsdauer',
          itemPrice: 'Stückpreis',
          totalPrice: 'Gesamtpreis',
          ending:
            state.taxRate === 0
              ? 'Der angegebene Preis ist der Endpreis gemäß § 19 UStG umsatzsteuerfrei (Kleinunternehmerregelung).'
              : `Der angegebene Preis ist der Endpreis inkl. ${state.taxRate}% MwSt.`,
          closing: 'Ich freue mich auf deine Rückmeldung!',
          project: 'Projekt',
          customer: 'Kunde',
          status: 'Status',
          note: 'Notiz',
        }
      : {
          hello: 'Hello!',
          intro: 'Here is your quote for the 3D printing job:',
          qty: 'Quantity',
          time: 'Estimated production time',
          itemPrice: 'Unit price',
          totalPrice: 'Total price',
          ending:
            state.taxRate === 0
              ? 'The quoted price is the final price and is VAT-exempt under the small business rule (§ 19 UStG equivalent).'
              : `The quoted price is the final price, including ${state.taxRate}% VAT.`,
          closing: 'Looking forward to your reply!',
          project: 'Project',
          customer: 'Customer',
          status: 'Status',
          note: 'Note',
        };

  const status = project ? statusLabels[lang][project.status] : '';

  return [
    copy.hello,
    '',
    copy.intro,
    '',
    `${copy.qty}: ${state.totalItems} ${lang === 'de' ? 'Stück' : 'units'}`,
    `${copy.time}: ${formatTime(results.orderTotalTime, lang)}`,
    '',
    `${copy.itemPrice}: ${formatCurrencyByLang(results.grossPerItem, lang)}`,
    `${copy.totalPrice}: ${formatCurrencyByLang(results.grossTotal, lang)}`,
    project ? '' : null,
    project ? `${copy.project}: ${project.name || (lang === 'de' ? 'Ohne Namen' : 'Unnamed')}` : null,
    project ? `${copy.customer}: ${project.customer || (lang === 'de' ? 'Nicht angegeben' : 'Not set')}` : null,
    project ? `${copy.status}: ${status}` : null,
    project && project.note ? `${copy.note}: ${project.note}` : null,
    '',
    copy.ending,
    '',
    copy.closing,
  ]
    .filter((line) => line !== null)
    .join('\n');
}
