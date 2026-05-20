import type { CalculatorState } from '../../../lib/calculator';
import { Field, InputFrame, NumberInput, PanelHeader, SectionCard, Surface, ToggleButton } from '../../ui';

type Translate = (key: string) => string;

type Props = {
  state: CalculatorState;
  t: Translate;
  onSetField: (field: Exclude<keyof CalculatorState, 'wearEnabled'>, value: number) => void;
  onToggleWear: () => void;
};

export function CalculatorFormPanel({ state, t, onSetField, onToggleWear }: Props) {
  return (
    <Surface as="section" className="p-6 lg:p-7">
      <PanelHeader title={t('tool.calculatorTitle')} subtitle={t('tool.calculatorBody')} />

      <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
        <SectionCard title={t('tool.sectionQuantities')} tone="blue">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('tool.itemsPerPlate')}>
              <InputFrame suffix="St.">
                <NumberInput
                  type="number"
                  min={1}
                  value={state.itemsPerPlate}
                  onChange={(event) => onSetField('itemsPerPlate', event.currentTarget.valueAsNumber || 1)}
                />
              </InputFrame>
            </Field>

            <Field label={t('tool.totalItems')}>
              <InputFrame suffix="St.">
                <NumberInput
                  type="number"
                  min={1}
                  value={state.totalItems}
                  onChange={(event) => onSetField('totalItems', event.currentTarget.valueAsNumber || 1)}
                />
              </InputFrame>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title={t('tool.sectionTime')} tone="slate">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('tool.hours')}>
              <NumberInput
                type="number"
                min={0}
                value={state.hours}
                onChange={(event) => onSetField('hours', event.currentTarget.valueAsNumber || 0)}
              />
            </Field>

            <Field label={t('tool.minutes')}>
              <NumberInput
                type="number"
                min={0}
                max={59}
                value={state.minutes}
                onChange={(event) => onSetField('minutes', event.currentTarget.valueAsNumber || 0)}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title={t('tool.sectionEnergy')} tone="slate">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('tool.power')}>
              <InputFrame suffix="W">
                <NumberInput
                  type="number"
                  min={0}
                  value={state.power}
                  onChange={(event) => onSetField('power', event.currentTarget.valueAsNumber || 0)}
                />
              </InputFrame>
            </Field>

            <Field label={t('tool.energyPrice')}>
              <InputFrame suffix="€">
                <NumberInput
                  type="number"
                  min={0}
                  step={0.01}
                  value={state.energyPrice}
                  onChange={(event) => onSetField('energyPrice', event.currentTarget.valueAsNumber || 0)}
                />
              </InputFrame>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title={t('tool.sectionMaterial')} tone="slate">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('tool.weight')}>
              <InputFrame suffix="g">
                <NumberInput
                  type="number"
                  min={0}
                  value={state.weight}
                  onChange={(event) => onSetField('weight', event.currentTarget.valueAsNumber || 0)}
                />
              </InputFrame>
            </Field>

            <Field label={t('tool.filamentPrice')}>
              <InputFrame suffix="€">
                <NumberInput
                  type="number"
                  min={0}
                  step={0.5}
                  value={state.filamentPrice}
                  onChange={(event) => onSetField('filamentPrice', event.currentTarget.valueAsNumber || 0)}
                />
              </InputFrame>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title={t('tool.sectionWear')} tone="slate">
          <ToggleButton active={state.wearEnabled} onClick={onToggleWear} label={t('tool.wearEnabled')} />

          {state.wearEnabled ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t('tool.printerPrice')}>
                <InputFrame suffix="€">
                  <NumberInput
                    type="number"
                    min={0}
                    value={state.printerPrice}
                    onChange={(event) => onSetField('printerPrice', event.currentTarget.valueAsNumber || 0)}
                  />
                </InputFrame>
              </Field>

              <Field label={t('tool.printerLife')}>
                <InputFrame suffix="h">
                  <NumberInput
                    type="number"
                    min={1}
                    value={state.printerLife}
                    onChange={(event) => onSetField('printerLife', event.currentTarget.valueAsNumber || 1)}
                  />
                </InputFrame>
              </Field>
            </div>
          ) : null}
        </SectionCard>
      </form>
    </Surface>
  );
}
