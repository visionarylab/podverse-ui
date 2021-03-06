import * as React from 'react'
import * as Modal from 'react-modal'
import { Alert, Form , FormFeedback, FormGroup, Input, Label } from 'reactstrap'
import { PasswordValidationInfo } from 'components/Auth/PasswordValidationInfo'
import { PVButton as Button } from 'components/Button/Button'
import { ButtonGroup } from 'components/Form/ButtonGroup/ButtonGroup'
import { CloseButton } from 'components/CloseButton/CloseButton'
import { checkIfLoadingOnFrontEnd } from 'lib/utility'
import { hasAtLeastXCharacters as hasAtLeastXCharactersLib, hasLowercase as hasLowercaseLib,
  hasMatchingStrings, hasNumber as hasNumberLib,
  hasUppercase as hasUppercaseLib, validateEmail, validatePassword } from 'lib/utility/validation'

type Props = {
  errorResponse?: string
  handleSignUp: Function
  hideModal: (event: React.MouseEvent<HTMLButtonElement>) => void
  isLoading: boolean
  isOpen: boolean
  showSignUpModal: (event: React.MouseEvent<HTMLButtonElement>) => void
  signUpFinished?: boolean
  submitIsDisabled?: boolean
  t: any
  topText?: string
}

type State = {
  email?: string
  errorEmail?: string
  errorPassword?: string
  errorPasswordConfirm?: string
  hasAtLeastXCharacters: boolean
  hasLowercase: boolean
  hasMatching: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasValidEmail: boolean
  password?: string
  passwordConfirm?: string
  submitIsDisabled: boolean
}

const customStyles = {
  content: {
    bottom: 'unset',
    left: '50%',
    maxWidth: '380px',
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
      errorPassword: undefined,
      errorPasswordConfirm: undefined,
      hasAtLeastXCharacters: false,
      hasLowercase: false,
      hasMatching: false,
      hasNumber: false,
      hasUppercase: false,
      hasValidEmail: false,
      password: '',
      passwordConfirm: '',
      submitIsDisabled: true
    }
  }

  handleEmailInputBlur = event => {
    const { t } = this.props
    const { value: email } = event.target
    const newState: any = {}
    newState.email = email

    if (!validateEmail(email)) {
      newState.errorEmail = t('errorMessages:message.PleaseProvideValidEmail')
    }

    this.setState(newState, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  handleEmailInputChange = event => {
    const { value: email } = event.target
    const newState: any = {}
    newState.email = email.trim()

    if (validateEmail(email)) {
      newState.hasValidEmail = true
      newState.errorEmail = null
    }

    this.setState(newState, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  handlePasswordInputBlur = event => {
    const { t } = this.props
    const { value: password } = event.target
    const newState: any = {}

    if (password && !validatePassword(password)) {
      newState.errorPassword = t('errorMessages:message.passwordError')
    } else if (validatePassword(password)) {
      newState.errorPassword = null
    }

    this.setState(newState, () => {
      this.passwordsValid()
    })
  }

  handlePasswordInputChange = event => {
    const { value: password } = event.target
    const newState: any = {}
    newState.password = password

    if (validatePassword(password)) {
      newState.errorPassword = null
    }

    this.setState(newState, () => {
      this.passwordsValid()
    })
  }

  handlePasswordConfirmInputBlur = event => {
    const { t } = this.props
    const { errorPassword, password } = this.state
    const { value: passwordConfirm } = event.target
    const newState: any = {}

    if (!errorPassword && passwordConfirm !== password) {
      newState.errorPasswordConfirm = t('errorMessages:message.passwordMatchError')
    }

    this.setState(newState, () => {
      this.passwordsValid()
    })
  }

  handlePasswordConfirmInputChange = event => {
    const { errorPassword, password } = this.state
    const { value: passwordConfirm } = event.target
    const newState: any = {}
    newState.passwordConfirm = passwordConfirm

    if (!errorPassword && passwordConfirm === password) {
      newState.errorPasswordConfirm = null
    }

    this.setState(newState, () => {
      this.passwordsValid()
    })
  }

  handleOnKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleSignUp()
    }
  }

  handleSignUp = () => {
    const { email, passwordConfirm } = this.state
    this.props.handleSignUp(email, passwordConfirm)
  }

  passwordsValid = () => {
    const { password, passwordConfirm } = this.state
    const hasAtLeastXCharacters = hasAtLeastXCharactersLib(password)
    const hasLowercase = hasLowercaseLib(password)
    const hasMatching = hasMatchingStrings(password, passwordConfirm)
    const hasNumber = hasNumberLib(password)
    const hasUppercase = hasUppercaseLib(password)

    this.setState({
      hasAtLeastXCharacters,
      hasLowercase,
      hasMatching,
      hasNumber,
      hasUppercase
    }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  checkIfSubmitIsDisabled = () => {
    const { hasAtLeastXCharacters, hasLowercase, hasMatching, hasNumber, hasUppercase,
      hasValidEmail } = this.state
    const submitIsDisabled = !(hasAtLeastXCharacters && hasLowercase && hasMatching && hasNumber &&
      hasUppercase && hasValidEmail)
    this.setState({ submitIsDisabled })
  }

  render () {
    const { errorResponse, hideModal, isLoading, isOpen, signUpFinished, t, topText } = this.props
    const { email, errorEmail, errorPassword, errorPasswordConfirm, hasAtLeastXCharacters,
      hasLowercase, hasNumber, hasUppercase, password, passwordConfirm, submitIsDisabled } = this.state

    let appEl
    if (checkIfLoadingOnFrontEnd()) {
      appEl = document.querySelector('body')
    }

    return (
      <Modal
        appElement={appEl}
        contentLabel={t('Sign Up')}
        isOpen={isOpen}
        onRequestClose={hideModal}
        portalClassName='sign-up-modal over-media-player'
        shouldCloseOnOverlayClick
        style={customStyles}>
        <Form>
          <h3>{signUpFinished ? t('Verify Email') : t('Sign Up')}</h3>
          <CloseButton onClick={hideModal} />
          {
            (errorResponse && !isLoading) &&
              <Alert color='danger'>
                {errorResponse}
              </Alert>
          }
          {
            signUpFinished &&
              <>
                <p style={{ marginTop: '32px', textAlign: 'center' }}>
                  {t('PleaseCheckInbox')}
                </p>
                <ButtonGroup
                  childrenLeft
                  childrenRight={
                    <Button
                      color='secondary'
                      onClick={hideModal}
                      text='Close' />
                  } />
              </>
          }
          {
            !signUpFinished &&
              <>
                <div style={{ overflow: 'hidden' }}>
                  {topText}
                  <FormGroup>
                    <Label for='sign-up-modal__email'>{t('Email')}</Label>
                    <Input
                      data-state-key='email'
                      invalid={errorEmail}
                      name='sign-up-modal__email'
                      onBlur={this.handleEmailInputBlur}
                      onChange={this.handleEmailInputChange}
                      onKeyPress={this.handleOnKeyPress}
                      placeholder='hello@podverse.fm'
                      type='email'
                      value={email} />
                    {
                      errorEmail &&
                        <FormFeedback invalid='true'>
                          {errorEmail}
                        </FormFeedback>
                    }
                  </FormGroup>
                  <FormGroup>
                    <Label for='sign-up-modal__password'>{t('Password')}</Label>
                    <Input
                      data-state-key='password'
                      invalid={errorPassword}
                      name='sign-up-modal__password'
                      onBlur={this.handlePasswordInputBlur}
                      onChange={this.handlePasswordInputChange}
                      onKeyPress={this.handleOnKeyPress}
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
                    <Label for='sign-up-modal__password-confirm'>{t('Confirm Password')}</Label>
                    <Input
                      data-state-key='passwordConfirm'
                      invalid={errorPasswordConfirm}
                      name='sign-up-modal__password-confirm'
                      onBlur={this.handlePasswordConfirmInputBlur}
                      onChange={this.handlePasswordConfirmInputChange}
                      onKeyPress={this.handleOnKeyPress}
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
                  <PasswordValidationInfo
                    hasAtLeastXCharacters={hasAtLeastXCharacters}
                    hasLowercase={hasLowercase}
                    hasNumber={hasNumber}
                    hasUppercase={hasUppercase}
                    t={t} />
                  <ButtonGroup
                    childrenLeft
                    childrenRight={
                      <React.Fragment>
                        <Button
                          onClick={hideModal}
                          text={t('Cancel')} />
                        <Button
                          color='primary'
                          disabled={submitIsDisabled}
                          isLoading={isLoading}
                          onClick={this.handleSignUp}
                          text={t('Sign Up')} />
                      </React.Fragment>
                    } />
                  </div>
                </>
          }
        </Form>
      </Modal>
    )
  }
}
