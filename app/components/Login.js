import React, { Component } from 'react';
import { connect } from 'react-redux';

import { attemptLogin } from '../redux/authentication/thunks.js';

import * as Font from './styled/Font.js';
import { Hr } from './styled/Div.js';
import { Container, FormRow, FormColumn } from './styled/Form.js';
import { TextInput, InputFeedback } from './styled/Input.js';
import { Button, AnchorButton } from './styled/Button.js';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {
        emailError: '',
        passwordError: '',
      },
    };
  }

  handleOnClick = e => {
    const { email, password } = this.state;
    e.preventDefault();
    this.props.attemptLogin({ email, password })
  };

  handleOnChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value }, () => this.validate(name, value));
  };

  componentDidUpdate() {
    if(this.props.user.id) {
      this.props.history.push('/')
    }
  }

  validate = (name, value) => {
    const { errors } = this.state;
    switch (name) {
      case 'email':
        const regex = /\S+@\S+\.\S+/;
        if (!value) {
          this.setState({
            errors: {
              ...errors,
              emailError: 'Email cannot be blank',
            },
          });
        } else if (!regex.test(value)) {
          this.setState({
            errors: {
              ...errors,
              emailError: 'Email invalid',
            },
          });
        } else {
          this.setState({
            errors: {
              ...errors,
              emailError: '',
            },
          });
        }
        break;

      case 'password':
        if (!value) {
          this.setState({
            errors: {
              ...errors,
              passwordError: 'Password cannot be blank',
            },
          });
        } else {
          this.setState({
            errors: {
              ...errors,
              passwordError: '',
            },
          });
        }
        break;
    }
  };

  render() {
    const {
      email,
      password,
      errors,
      errors: { emailError, passwordError },
    } = this.state;

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
      <img src="https://zombieforums.nyc3.cdn.digitaloceanspaces.com/header-1.png" width="350" height="205" />
      <Container>
        <Font.h3>Sign in with Social Media</Font.h3>
        <FormRow>
          <AnchorButton secondary href="/api/github/login">
            Github
          </AnchorButton>

          <AnchorButton secondary onClick={this.handleOnClick}>
            Google
          </AnchorButton>
        </FormRow>
        <Hr/>
        <Font.h3>Sign in with Email</Font.h3>
        <FormColumn>
          <TextInput
            type="text"
            placeholder="email"
            onChange={this.handleOnChange}
            name="email"
            value={email}
          />
          <InputFeedback>{emailError}</InputFeedback>
        </FormColumn>

        <FormColumn>
          <TextInput
            type="password"
            placeholder="password"
            onChange={this.handleOnChange}
            name="password"
            value={password}
          />
          <InputFeedback>{passwordError}</InputFeedback>
        </FormColumn>

        <Button
          disabled={
            !email || !password || Object.values(errors).some(val => !!val)
              ? true
              : false
          }
          onClick={this.handleOnClick}
        >
          Login
        </Button>
        <Font.Anchor href="#">Forgot Password?</Font.Anchor>
      </Container>
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => ({ user });

const mapDispatchToProps = dispatch => ({ attemptLogin: info => dispatch(attemptLogin(info)) })

export default connect(mapStateToProps, mapDispatchToProps)(Login);
