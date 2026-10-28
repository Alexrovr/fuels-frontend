import './FeedPage.css'
import { type FC, useEffect, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { type FuelDetail, getFeedFuel } from '../modules/fuelsApi'
import { fallbackToDefaultVideo, imageOrDefault, videoOrDefault } from '../modules/media'
import { SourceNote } from '../components/SourceNote/SourceNote'
import { ROUTES } from '../Routes'

// Лента: одна карточка на весь экран поверх видео (как SSR-страница /fuel_feed).
// /feed — первая карточка, /feed/:id — выбранная в плитке.
export const FeedPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [fuel, setFuel] = useState<FuelDetail | null>(null)
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [noteOpen, setNoteOpen] = useState(false) // «Больше» / «Меньше» у описания

  // Загрузка карточки при открытии страницы и при смене :id в адресе
  useEffect(() => {
    // карточку уже загрузила кнопка «Следующий» — повторный запрос не нужен
    if (fuel && String(fuel.fuel_id) === id) return

    let ignore = false
    setLoading(true)

    getFeedFuel(id).then((result) => {
      if (ignore) return
      setFuel(result.data)
      setFromMock(result.fromMock)
      setLoading(false)
    })

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // «Следующий»: GET /api/fuels/feed/:id?next=true (по кругу), затем адрес /feed/<ид следующей>
  const handleNext = async () => {
    if (!fuel) return
    setLoading(true)
    const result = await getFeedFuel(fuel.fuel_id, true)
    setFuel(result.data)
    setFromMock(result.fromMock)
    setNoteOpen(false)
    setLoading(false)
    if (result.data) navigate(`${ROUTES.FEED}/${result.data.fuel_id}`)
  }

  if (!fuel) {
    return (
      <section className="feedEmpty">
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <p className="feedEmptyText">Такого вида топлива нет в справочнике</p>
            <Button variant="heat" onClick={() => navigate(ROUTES.GRID)}>
              Вернуться к плитке
            </Button>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="feedReel">
      {/* key — новый элемент video на каждую карточку: сбрасывает подмену src из onError */}
      <video
        key={fuel.fuel_id}
        className="feedVideo"
        poster={imageOrDefault(fuel.image_url)}
        src={videoOrDefault(fuel.video_url)}
        onError={fallbackToDefaultVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="feedShade" />
      {fromMock && <SourceNote overlay />}

      <div className="feedOverlay">
        <div className="feedBottom">
          <h1 className="feedName">{fuel.fuel_name}</h1>
          <p className={`feedNote ${noteOpen ? 'feedNoteOpen' : ''}`}>{fuel.combustion_note}</p>
          <button type="button" className="feedNoteToggle" onClick={() => setNoteOpen((open) => !open)}>
            {noteOpen ? 'Меньше' : 'Больше'}
          </button>
        </div>

        <div className="feedSide">
          <dl className="feedFacts">
            <div className="feedFact">
              <dt className="feedFactKey">Теплота сгорания</dt>
              <dd className="feedFactValue">
                {fuel.heat_of_combustion_kj.toLocaleString('ru-RU')}
                <span className="feedFactUnit">кДж/м³</span>
              </dd>
            </div>
            <div className="feedFact">
              <dt className="feedFactKey">Воспламенение</dt>
              <dd className="feedFactValue">
                {fuel.ignition_temp_c}
                <span className="feedFactUnit">°C</span>
              </dd>
            </div>
          </dl>

          <span className="feedLikes" title="Количество лайков. Поставить лайк можно после входа">
            <span className="feedLikesIcon">&#10084;</span>
            {fuel.likes_count}
          </span>

          <Button variant="heat" className="feedNext" onClick={handleNext} disabled={loading}>
            Следующий
          </Button>
        </div>
      </div>
    </section>
  )
}
