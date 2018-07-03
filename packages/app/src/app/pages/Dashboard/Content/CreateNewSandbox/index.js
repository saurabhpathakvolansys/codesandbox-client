import React from 'react';
import { Spring } from 'react-spring';
import { inject } from 'mobx-react';
import { ThemeProvider } from 'styled-components';

import theme from 'common/theme';
import Portal from 'app/components/Portal';
import { Container, AnimatedModalContainer } from './elements';

import Modal from './Modal';

class CreateNewSandbox extends React.PureComponent {
  state = {
    creating: false,
    closingCreating: false,
    forking: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.mouseListener);
    document.addEventListener('keydown', this.keydownListener);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.mouseListener);
    document.removeEventListener('keydown', this.keydownListener);
  }

  createSandbox = template => {
    this.setState({ forking: true }, () => {
      this.props.signals.dashboard.createSandboxClicked({
        sandboxId: template.shortid,
        body: {
          collectionId: this.props.collectionId,
        },
      });
    });
  };

  close = () => {
    this.setState({ closingCreating: true }, () => {
      setTimeout(() => {
        this.setState({ creating: false, closingCreating: false });
      }, 500);
    });
  };

  mouseListener = e => {
    if (!e.defaultPrevented && this.state.creating) {
      this.close();
    }
  };

  keydownListener = e => {
    if (e.keyCode === 27) {
      // Escape

      this.close();
    }
  };

  handleClick = () => {
    this.setState({ creating: true });
  };

  render() {
    const { style } = this.props;

    const fromRects = this.ref ? this.ref.getBoundingClientRect() : {};
    const toRects = this.toRef ? this.toRef.getBoundingClientRect() : {};

    let usedRects = [
      {
        position: 'fixed',
        top: toRects.y,
        left: toRects.x,
        height: toRects.height,
        width: toRects.width,
        overflow: 'auto',
      },
      {
        position: 'fixed',
        left: fromRects.x,
        top: fromRects.y,
        width: fromRects.width,
        height: fromRects.height,
        overflow: 'hidden',
      },
    ];

    if (!this.state.closingCreating) {
      usedRects = usedRects.reverse();
    }

    return (
      <React.Fragment>
        {this.state.creating && (
          <Portal>
            <ThemeProvider theme={theme}>
              <Spring native from={usedRects[0]} to={usedRects[1]}>
                {newStyle => (
                  <AnimatedModalContainer
                    tabIndex="-1"
                    aria-modal="true"
                    aria-labelledby="new-sandbox"
                    forking={this.state.forking}
                    style={
                      this.state.forking
                        ? {
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                          }
                        : newStyle
                    }
                  >
                    <Modal
                      width={toRects.width}
                      forking={this.state.forking}
                      closing={this.state.closingCreating}
                      createSandbox={this.createSandbox}
                    />
                  </AnimatedModalContainer>
                )}
              </Spring>
            </ThemeProvider>
          </Portal>
        )}

        <div
          ref={node => {
            this.ref = node;
          }}
          style={style}
        >
          <Container
            onClick={this.handleClick}
            tabIndex="0"
            role="button"
            hide={this.state.creating}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.handleClick();
              }
            }}
          >
            Create Sandbox
          </Container>
          <Portal>
            <div
              style={{
                opacity: 0,
                zIndex: 0,
                pointerEvents: 'none',
                position: 'fixed',
                top: '25vh',
                bottom: 0,
                right: 0,
                left: 0,

                margin: '0 auto 20vh',
                height: 'auto',
                width: 950,
              }}
            >
              <div
                ref={node => {
                  this.toRef = node;
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Portal>
        </div>
      </React.Fragment>
    );
  }
}

export default inject('signals')(CreateNewSandbox);