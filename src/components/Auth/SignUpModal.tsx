import * as React from 'react'
import * as Modal from 'react-modal'
import { Alert, Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import { PVButton as Button } from 'components/Button/Button'
import { ButtonGroup } from 'components/Form/ButtonGroup/ButtonGroup'
import { CloseButton } from 'components/CloseButton/CloseButton'
import { validateEmail, validatePassword } from 'lib/utility/validation'

type Props = {
  handleSignUp: Function
  hideModal: (event: React.MouseEvent<HTMLButtonElement>) => void
  isLoading: boolean
  isOpen: boolean
  showSignUpModal: (event: React.MouseEvent<HTMLButtonElement>) => void
}

type State = {
  email?: string
  errorEmail?: string
  errorGeneral?: string
  errorPassword?: string
  errorPasswordConfirm?: string
  password?: string
  passwordConfirm?: string
}

const customStyles = {
  content: {
    bottom: 'unset',
    left: '50%',
    maxWidth: '360px',
    right: 'unset',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%'
  }
}

export class SignUpModal extends React.Component<Props, State> {

  constructor (props) {
    super(props)

    this.state = {
      email: '',
      errorEmail: undefined,
      errorGeneral: undefined,
      errorPassword: undefined,
      errorPasswordConfirm: undefined,
      password: '',
      passwordConfirm: ''
    }

    this.handleEmailInputBlur = this.handleEmailInputBlur.bind(this)
    this.handleEmailInputChange = this.handleEmailInputChange.bind(this)
    this.handlePasswordInputBlur = this.handlePasswordInputBlur.bind(this)
    this.handlePasswordInputChange = this.handlePasswordInputChange.bind(this)
    this.handlePasswordConfirmInputBlur = this.handlePasswordConfirmInputBlur.bind(this)
    this.handlePasswordConfirmInputChange = this.handlePasswordConfirmInputChange.bind(this)
    this.hasEmailAndConfirmedValidPassword = this.hasEmailAndConfirmedValidPassword.bind(this)
  }

  handleEmailInputBlur (event) {
    const { value: email } = event.target
    const newState: any = {}
    newState.email = email

    if (!validateEmail(email)) {
      newState.errorEmail = 'Please provide a valid email address.'
    }

    this.setState(newState)
  }

  handleEmailInputChange (event) {
    const { value: email } = event.target
    const newState: any = {}
    newState.email = email

    if (validateEmail(email)) {
      newState.errorEmail = null
    }

    this.setState(newState)
  }

  handlePasswordInputBlur (event) {
    const { value: password } = event.target
    const newState: any = {}

    if (password && !validatePassword(password)) {
      newState.errorPassword = 'Password must contain a number, uppercase, lowercase, and be at least 8 characters long.'
    }

    this.setState(newState)
  }

  handlePasswordInputChange (event) {
    const { value: password } = event.target
    const newState: any = {}
    newState.password = password

    if (validatePassword(password)) {
      newState.errorPassword = null
    }

    this.setState(newState)
  }

  handlePasswordConfirmInputBlur (event) {
    const { errorPassword, password } = this.state
    const { value: passwordConfirm } = event.target
    const newState: any = {}

    if (!errorPassword && passwordConfirm !== password) {
      newState.errorPasswordConfirm = 'Passwords do not match.'
    }

    this.setState(newState)
  }

  handlePasswordConfirmInputChange (event) {
    const { errorPassword, password } = this.state
    const { value: passwordConfirm } = event.target
    const newState: any = {}
    newState.passwordConfirm = passwordConfirm

    if (!errorPassword && passwordConfirm === password) {
      newState.errorPasswordConfirm = null
    }

    this.setState(newState)
  }

  handleSignUp () {
    const { email, passwordConfirm } = this.state
    this.clearErrors()
    this.props.handleSignUp(email, passwordConfirm)
  }

  clearErrors () {
    this.setState({ errorGeneral: undefined })
  }

  hasEmailAndConfirmedValidPassword () {
    const { email, password, passwordConfirm } = this.state

    return validateEmail(email)
      && password === passwordConfirm
      && validatePassword(password)
      && validatePassword(passwordConfirm)
  }

  render () {

    const { hideModal, isLoading, isOpen } = this.props
    const { email, errorEmail, errorGeneral, errorPassword, errorPasswordConfirm,
      password, passwordConfirm } = this.state

    let appEl
    // @ts-ignore
    if (process.browser) {
      appEl = document.querySelector('body')
    }

    return (
      <Modal
        appElement={appEl}
        contentLabel='Sign Up'
        isOpen={isOpen}
        onRequestClose={hideModal}
        portalClassName='sign-up-modal over-media-player'
        shouldCloseOnOverlayClick
        style={customStyles}>
        <Form>
          <h4>Sign Up</h4>
          <CloseButton onClick={hideModal} />
          {
            errorGeneral &&
            <Alert color='danger'>
              {errorGeneral}
            </Alert>
          }
          <FormGroup>
            <Label for='sign-up-modal__email'>Email</Label>
            <Input
              data-state-key='email'
              invalid={errorEmail}
              name='sign-up-modal__email'
              onBlur={this.handleEmailInputBlur}
              onChange={this.handleEmailInputChange}
              placeholder='hello@podverse.fm'
              type='text'
              value={email} />
            {
              errorEmail &&
              <FormFeedback invalid='true'>
                {errorEmail}
              </FormFeedback>
            }
          </FormGroup>
          <FormGroup>
            <Label for='sign-up-modal__password'>Password</Label>
            <Input
              data-state-key='password'
              invalid={errorPassword}
              name='sign-up-modal__password'
              onBlur={this.handlePasswordInputBlur}
              onChange={this.handlePasswordInputChange}
              placeholder='********'
              type='password'
              value={password} />
            {
              errorPassword &&
              <FormFeedback invalid='true'>
                {errorPassword}
              </FormFeedback>
            }
          </FormGroup>
          <FormGroup>
            <Label for='sign-up-modal__password-confirm'>Confirm Password</Label>
            <Input
              data-state-key='passwordConfirm'
              invalid={errorPasswordConfirm}
              name='sign-up-modal__password-confirm'
              onBlur={this.handlePasswordConfirmInputBlur}
              onChange={this.handlePasswordConfirmInputChange}
              placeholder='********'
              type='password'
              value={passwordConfirm} />
            {
              errorPasswordConfirm &&
              <FormFeedback invalid='true'>
                {errorPasswordConfirm}
              </FormFeedback>
            }
          </FormGroup>
          <ButtonGroup
            childrenLeft
            childrenRight={
              <React.Fragment>
                <Button
                  onClick={hideModal}
                  text='Cancel' />
                <Button
                  color='primary'
                  disabled={!this.hasEmailAndConfirmedValidPassword()}
                  isLoading={isLoading}
                  onClick={this.handleSignUp}
                  text='Submit' />
              </React.Fragment>
            } />
        </Form>
      </Modal>
    )
  }
}
