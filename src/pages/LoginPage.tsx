import { type FC, type FormEvent, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { loginRequest, saveToken } from '../api/auth'
import { errorMessage } from '../api/errors'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { authRequestFailed, authRequestStarted, loginSucceeded } from '../store/userSlice'

// Страница входа. По заданию авторизация — только axios, без кодогенерации и thunk:
// запрос выполняется здесь, а результат вручную передаётся в Redux действиями userSlice.
export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.user)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) return <Navigate to={ROUTES.GRID} replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    dispatch(authRequestStarted())
    try {
      const response = await loginRequest(login.trim(), password)
      const token = response.access_token ?? ''
      saveToken(token) // JWT в localStorage — виден во вкладке Application
      api.setSecurityData(token) // сгенерированный клиент начнёт слать Authorization: Bearer
      dispatch(loginSucceeded(response.user ?? {}))
      navigate(ROUTES.GRID)
    } catch (requestError) {
      dispatch(authRequestFailed(errorMessage(requestError, 'Не удалось войти')))
    }
  }

  return (
    <Form className="heatForm" onSubmit={handleSubmit}>
      <h2 className="heatFormTitle">Вход</h2>
      <p className="heatFormHint">
        После входа можно добавлять виды топлива, ставить лайки и удалять свои карточки
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group controlId="login">
        <Form.Label>Логин</Form.Label>
        <Form.Control
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          autoComplete="username"
          required
        />
      </Form.Group>

      <Form.Group controlId="password">
        <Form.Label>Пароль</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </Form.Group>

      <Button variant="heat" type="submit" disabled={loading}>
        Войти
      </Button>
    </Form>
  )
}
