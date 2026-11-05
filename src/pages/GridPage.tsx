import './GridPage.css'
import { type FC, useEffect, useState } from 'react'
import { Alert, Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { HeatFilter } from '../components/HeatFilter/HeatFilter'
import { FuelCard } from '../components/FuelCard/FuelCard'
import { SourceNote } from '../components/SourceNote/SourceNote'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { deleteFuel, getFuelsList, setMinHeat } from '../store/fuelsSlice'

// Плитка: фильтр по теплоте сгорания и карточки в два столбца.
// Применённый фильтр хранится в Redux (fuels.minHeat), поэтому сохраняется при переходах
// между страницами и сбрасывается при выходе пользователя.
export const GridPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { minHeat, list, fromMock, loading, deletingId, error } = useAppSelector((state) => state.fuels)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  // положение слайдера до нажатия «Найти»; при сбросе фильтра в Redux возвращается к нему
  const [sliderValue, setSliderValue] = useState(minHeat)
  const [syncedMinHeat, setSyncedMinHeat] = useState(minHeat)
  if (syncedMinHeat !== minHeat) {
    setSyncedMinHeat(minHeat)
    setSliderValue(minHeat)
  }

  // Загрузка карточек: при открытии страницы, при новом фильтре и при входе/выходе
  // (у пользователя в ответе отмечены свои карточки — is_mine)
  useEffect(() => {
    dispatch(getFuelsList())
  }, [dispatch, minHeat, isAuthenticated])

  const handleDelete = (fuelId: number, fuelName: string) => {
    if (window.confirm(`Удалить «${fuelName}»?`)) dispatch(deleteFuel(fuelId))
  }

  return (
    <div className="gridPage">
      <HeatFilter
        value={sliderValue}
        setValue={setSliderValue}
        onSubmit={() => dispatch(setMinHeat(sliderValue))}
        loading={loading}
      />

      {fromMock && <SourceNote />}
      {error && <Alert variant="danger">{error}</Alert>}

      {list.length ? (
        <Row xs={2} className="g-2">
          {list.map((fuel) => (
            <Col key={fuel.fuel_id}>
              <FuelCard
                fuel={fuel}
                onClick={() => navigate(`${ROUTES.FEED}/${fuel.fuel_id}`)}
                onDelete={
                  isAuthenticated && fuel.is_mine
                    ? () => handleDelete(fuel.fuel_id, fuel.fuel_name)
                    : undefined
                }
                disabled={deletingId !== null}
              />
            </Col>
          ))}
        </Row>
      ) : (
        !loading &&
        !error && (
          <p className="gridEmpty">
            Нет видов топлива с теплотой сгорания от {minHeat.toLocaleString('ru-RU')} кДж/м³.
            Уменьшите значение фильтра.
          </p>
        )
      )}
    </div>
  )
}
