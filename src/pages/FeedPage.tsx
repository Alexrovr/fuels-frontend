import './FeedPage.css'
import { type FC, useEffect, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { fallbackToDefaultVideo, imageOrDefault, videoOrDefault } from '../modules/media'
import { SourceNote } from '../components/SourceNote/SourceNote'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getFeedFuel, likeFuel } from '../store/feedSlice'

// Лента: одна карточка на весь экран поверх видео (как SSR-страница /fuel_feed).
// /feed — первая карточка, /feed/:id — выбранная в плитке.
export const FeedPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { fuel, loaded, fromMock, loading, liking, error } = useAppSelector((state) => state.feed)
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const [noteOpen, setNoteOpen] = useState(false) // «Больше» / «Меньше» у описания

  // Загрузка карточки при открытии страницы, смене :id в адресе и входе/выходе
  // (от пользователя зависит is_liked)
  useEffect(() => {
    // карточку уже загрузила кнопка «Следующий» — повторный запрос не нужен
    if (fuel && String(fuel.fuel_id) === id) return
    dispatch(getFeedFuel({ id: id === undefined ? undefined : Number(id) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isAuthenticated])

  // «Следующий»: GET /api/fuels/feed/:id?next=true (по кругу), затем адрес /feed/<ид следующей>
  const handleNext = async () => {
    if (!fuel) return
    const result = await dispatch(getFeedFuel({ id: fuel.fuel_id, next: true }))
    setNoteOpen(false)
    if (getFeedFuel.fulfilled.match(result) && result.payload.fuel) {
      navigate(`${ROUTES.FEED}/${result.payload.fuel.fuel_id}`)
    }
  }

  // Лайк: поставить, если ещё не стоит, иначе снять
  const handleLike = () => {
    if (fuel) dispatch(likeFuel({ fuelId: fuel.fuel_id, like: fuel.is_liked ? 0 : 1 }))
  }

  if (!fuel) {
    return (
      <section className="feedEmpty">
        {error && <Alert variant="danger">{error}</Alert>}
        {loaded && !loading && (
          <>
            {!error && <p className="feedEmptyText">Такого вида топлива нет в справочнике</p>}
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
      {error && (
        <Alert variant="danger" className="feedError">
          {error}
        </Alert>
      )}

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

          {isAuthenticated && !fromMock ? (
            <button
              type="button"
              className={`feedLikes feedLikeButton ${fuel.is_liked ? 'feedLiked' : ''}`}
              onClick={handleLike}
              disabled={liking}
              title={fuel.is_liked ? 'Убрать лайк' : 'Поставить лайк'}
            >
              <span className="feedLikesIcon">{fuel.is_liked ? '❤' : '♡'}</span>
              {fuel.likes_count}
            </button>
          ) : (
            <span className="feedLikes" title="Количество лайков. Поставить лайк можно после входа">
              <span className="feedLikesIcon">&#10084;</span>
              {fuel.likes_count}
            </span>
          )}

          <Button variant="heat" className="feedNext" onClick={handleNext} disabled={loading}>
            Следующий
          </Button>
        </div>
      </div>
    </section>
  )
}
