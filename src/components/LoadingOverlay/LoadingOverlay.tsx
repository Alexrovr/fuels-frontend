import './LoadingOverlay.css'
import type { FC } from 'react'
import { Spinner } from 'react-bootstrap'

interface Props {
  show: boolean // идёт запрос к веб-сервису
}

// Анимация загрузки поверх всего приложения: полупрозрачный слой перехватывает
// клики, поэтому кнопки страницы и меню нажать нельзя, пока не придёт ответ.
export const LoadingOverlay: FC<Props> = ({ show }) =>
  show ? (
    <div className="loadingOverlay" role="status" aria-live="polite">
      <Spinner animation="border" className="loadingOverlaySpinner" />
      <span className="loadingOverlayText">Загрузка…</span>
    </div>
  ) : null
