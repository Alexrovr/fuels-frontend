import './DraftPage.css'
import { type FC, type FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { fallbackToDefaultImage, imageOrDefault } from '../modules/media'
import type { FuelDetail } from '../modules/types'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createFuelDraft, deleteFuelDraft, getFuelDraft, publishFuelDraft } from '../store/draftSlice'

// Добавление вида топлива — только для вошедшего пользователя (гость → страница входа).
// Шаг 1 «Далее»: название, изображение и видео → POST /api/fuels, создаётся черновик.
// Шаг 2 «Опубликовать»: описание и два поля по теме → PUT /api/fuels/:id/publish.
// У пользователя не больше одного черновика: если он уже есть, сразу открывается шаг 2.
export const DraftPage: FC = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)
  const { draft, loaded, loading, error } = useAppSelector((state) => state.draft)

  useEffect(() => {
    if (isAuthenticated) dispatch(getFuelDraft())
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  return (
    <div className="draftPage">
      {error && (
        <Alert variant="danger" className="draftError">
          {error}
        </Alert>
      )}
      {loaded &&
        (draft ? (
          <PublishStep key={draft.fuel_id} draft={draft} disabled={loading} />
        ) : (
          <CreateStep disabled={loading} />
        ))}
    </div>
  )
}

// Шаг 1: черновик с названием и медиа (файлы загружаются в Minio)
const CreateStep: FC<{ disabled: boolean }> = ({ disabled }) => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!image || !video) return
    dispatch(createFuelDraft({ fuel_name: name.trim(), image, video }))
  }

  return (
    <Form className="heatForm" onSubmit={handleSubmit}>
      <h2 className="heatFormTitle">Новый вид топлива</h2>
      <p className="heatFormHint">Шаг 1 из 2 — название, изображение и видео горения</p>

      <Form.Group controlId="fuel_name">
        <Form.Label>Название</Form.Label>
        <Form.Control
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={128}
          placeholder="Например, Этилен"
          required
        />
      </Form.Group>

      <Form.Group controlId="image">
        <Form.Label>Изображение (jpeg, png, gif, webp, svg — до 5 МБ)</Form.Label>
        <Form.Control
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={(event) => setImage((event.target as HTMLInputElement).files?.[0] ?? null)}
          required
        />
      </Form.Group>

      <Form.Group controlId="video">
        <Form.Label>Видео (mp4, webm — до 30 МБ)</Form.Label>
        <Form.Control
          type="file"
          accept="video/mp4,video/webm"
          onChange={(event) => setVideo((event.target as HTMLInputElement).files?.[0] ?? null)}
          required
        />
      </Form.Group>

      <Button variant="heat" type="submit" disabled={disabled || !name.trim() || !image || !video}>
        Далее
      </Button>
    </Form>
  )
}

// Шаг 2: дозаполнение черновика и публикация; черновик можно удалить
const PublishStep: FC<{ draft: FuelDetail; disabled: boolean }> = ({ draft, disabled }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [note, setNote] = useState(draft.combustion_note)
  const [heat, setHeat] = useState(draft.heat_of_combustion_kj ? String(draft.heat_of_combustion_kj) : '')
  const [ignition, setIgnition] = useState(draft.ignition_temp_c ? String(draft.ignition_temp_c) : '')

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault()
    const result = await dispatch(
      publishFuelDraft({
        fuelId: draft.fuel_id,
        body: {
          combustion_note: note.trim(),
          heat_of_combustion_kj: Number(heat),
          ignition_temp_c: Number(ignition),
        },
      }),
    )
    // опубликованная карточка сразу открывается в ленте
    if (publishFuelDraft.fulfilled.match(result)) navigate(`${ROUTES.FEED}/${result.payload.fuel_id}`)
  }

  const handleDelete = () => {
    if (window.confirm(`Удалить черновик «${draft.fuel_name}»?`)) dispatch(deleteFuelDraft(draft.fuel_id))
  }

  return (
    <Form className="heatForm" onSubmit={handlePublish}>
      <h2 className="heatFormTitle">Черновик: {draft.fuel_name}</h2>
      <p className="heatFormHint">Шаг 2 из 2 — описание реакции и параметры горения</p>

      <img
        className="draftImage"
        src={imageOrDefault(draft.image_url)}
        alt={draft.fuel_name}
        onError={fallbackToDefaultImage}
      />

      <Form.Group controlId="combustion_note">
        <Form.Label>Описание реакции горения</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          required
        />
      </Form.Group>

      <div className="draftRow">
        <Form.Group controlId="heat_of_combustion_kj">
          <Form.Label>Теплота сгорания, кДж/м³</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={heat}
            onChange={(event) => setHeat(event.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="ignition_temp_c">
          <Form.Label>Воспламенение, °C</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={ignition}
            onChange={(event) => setIgnition(event.target.value)}
            required
          />
        </Form.Group>
      </div>

      <Button variant="heat" type="submit" disabled={disabled}>
        Опубликовать
      </Button>
      <Button variant="outline-heat" type="button" onClick={handleDelete} disabled={disabled}>
        Удалить черновик
      </Button>
    </Form>
  )
}
