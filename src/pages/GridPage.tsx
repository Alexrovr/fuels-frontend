import './GridPage.css'
import { type FC, useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { type FuelListItem, getFuels } from '../modules/fuelsApi'
import { HeatFilter } from '../components/HeatFilter/HeatFilter'
import { FuelCard } from '../components/FuelCard/FuelCard'
import { SourceNote } from '../components/SourceNote/SourceNote'
import { ROUTES } from '../Routes'

// Плитка: фильтр по теплоте сгорания и карточки в два столбца.
// Применённый фильтр хранится в адресе (/grid?min_heat=50000), как в SSR-версии,
// поэтому он переживает перезагрузку страницы и кнопку «Назад».
export const GridPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedMinHeat = Number(searchParams.get('min_heat')) || 0

  const [minHeat, setMinHeat] = useState(appliedMinHeat) // положение слайдера до нажатия «Найти»
  const [fuels, setFuels] = useState<FuelListItem[]>([])
  const [fromMock, setFromMock] = useState(false)
  // для какого фильтра загружены карточки; пока ответа нет — показываем спиннер
  const [loadedMinHeat, setLoadedMinHeat] = useState<number | null>(null)
  const loading = loadedMinHeat !== appliedMinHeat
  const navigate = useNavigate()

  // Загрузка карточек при открытии страницы и при каждом изменении фильтра в адресе.
  // ignore защищает от ответа, пришедшего после ухода со страницы
  // или после более нового запроса.
  useEffect(() => {
    let ignore = false

    getFuels(appliedMinHeat).then((result) => {
      if (ignore) return
      setFuels(result.data)
      setFromMock(result.fromMock)
      setLoadedMinHeat(appliedMinHeat)
    })

    return () => {
      ignore = true
    }
  }, [appliedMinHeat])

  const handleSearch = () => {
    setSearchParams(minHeat > 0 ? { min_heat: String(minHeat) } : {})
  }

  return (
    <div className="gridPage">
      <HeatFilter value={minHeat} setValue={setMinHeat} onSubmit={handleSearch} loading={loading} />

      {fromMock && <SourceNote />}

      {loading ? (
        <div className="gridLoader">
          <Spinner animation="border" />
        </div>
      ) : fuels.length ? (
        <Row xs={2} className="g-2">
          {fuels.map((fuel) => (
            <Col key={fuel.fuel_id}>
              <FuelCard fuel={fuel} onClick={() => navigate(`${ROUTES.FEED}/${fuel.fuel_id}`)} />
            </Col>
          ))}
        </Row>
      ) : (
        <p className="gridEmpty">
          Нет видов топлива с теплотой сгорания от {appliedMinHeat.toLocaleString('ru-RU')} кДж/м³.
          Уменьшите значение фильтра.
        </p>
      )}
    </div>
  )
}
