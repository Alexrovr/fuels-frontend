import './SourceNote.css'
import type { FC } from 'react'
import { Badge } from 'react-bootstrap'

interface Props {
  overlay?: boolean // поверх видео в ленте — светлый текст на полупрозрачном фоне
}

// Пометка, что веб-сервис не ответил и карточки взяты из mock-коллекции
export const SourceNote: FC<Props> = ({ overlay }) => (
  <div className={`sourceNote ${overlay ? 'sourceNoteOverlay' : ''}`}>
    <Badge bg="dark">mock</Badge> веб-сервис недоступен, показаны mock-данные
  </div>
)
