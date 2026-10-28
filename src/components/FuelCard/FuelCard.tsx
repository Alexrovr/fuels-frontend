import './FuelCard.css'
import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import type { FuelListItem } from '../../modules/fuelsApi'
import { fallbackToDefaultImage, imageOrDefault } from '../../modules/media'

interface Props {
  fuel: FuelListItem // данные карточки из плитки (веб-сервис или mock)
  onClick: () => void // что делать по клику — решает страница (переход в ленту)
}

// Карточка плитки: изображение, название, теплота сгорания и число лайков.
// Пустой image_url заменяется изображением по умолчанию из public/.
export const FuelCard: FC<Props> = ({ fuel, onClick }) => (
  <Card className="fuelCard" onClick={onClick}>
    <Card.Img
      className="fuelCardImage"
      variant="top"
      src={imageOrDefault(fuel.image_url)}
      alt={fuel.fuel_name}
      onError={fallbackToDefaultImage}
    />
    <Card.Body className="fuelCardBody">
      <Card.Title className="fuelCardName">{fuel.fuel_name}</Card.Title>
      <Card.Text className="fuelCardHeat">
        {fuel.heat_of_combustion_kj.toLocaleString('ru-RU')} <span className="fuelCardUnit">кДж/м³</span>
      </Card.Text>
      <span className="fuelCardLikes" title="Количество лайков">
        <span className="fuelCardLikesIcon">&#10084;</span> {fuel.likes_count}
      </span>
    </Card.Body>
  </Card>
)
