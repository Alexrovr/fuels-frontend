import './HeatFilter.css'
import type { FC } from 'react'
import { Button, Form } from 'react-bootstrap'

interface Props {
  value: number // текущее положение слайдера, кДж/м³
  setValue: (value: number) => void // родитель хранит значение в своём состоянии
  onSubmit: () => void // нажатие «Найти» — родитель загружает карточки
  loading?: boolean // пока идёт загрузка, кнопка недоступна
  max?: number
  step?: number
}

const formatHeat = (value: number) => value.toLocaleString('ru-RU')

// Фильтр плитки по теплоте сгорания: слайдер с подписями делений и кнопка «Найти».
// Состояния у компонента нет — значение и обработчики приходят через props.
export const HeatFilter: FC<Props> = ({
  value,
  setValue,
  onSubmit,
  loading,
  max = 110000,
  step = 1000,
}) => {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((part) => max * part)

  return (
    <Form
      className="heatFilter"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Form.Label className="heatFilterLabel" htmlFor="min_heat">
        Теплота сгорания не менее, кДж/м³
      </Form.Label>
      <Form.Range
        id="min_heat"
        className="heatFilterSlider"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <div className="heatFilterTicks" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} style={{ left: `${(tick / max) * 100}%` }}>
            {formatHeat(tick)}
          </span>
        ))}
      </div>
      <div className="heatFilterActions">
        <span className="heatFilterValue">от {formatHeat(value)} кДж/м³</span>
        <Button variant="heat" type="submit" disabled={loading}>
          Найти
        </Button>
      </div>
    </Form>
  )
}
