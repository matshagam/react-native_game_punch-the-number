import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';

import { Attempts } from './components/attempts';
import { InputGuess } from './components/input-guess';
import { Chance } from './components/chance';
import { LeftCircle } from './components/left-circle';
import { RightCircle } from './components/right-circle';
import { ButtonGame } from './components/button-game';

import { setAsync, getAsync, randomNumber } from './components/helpers';
var count = 0,
  lastGame = 0,
  trueGame = 0,
  interval;

getAsync('attempts').then(data => {
  lastGame = data;
});
getAsync('gameNumber').then(data => {
  trueGame = data;
});

export default class GameScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lastGame: lastGame === 10 ? 'Lost' : lastGame,
      trueGame: trueGame,
      game: false,
      attempts: 'Punch!',
      guess: 0,
      randomNumber: randomNumber(),
      circleSize: 100,
      timer: 15,
      speech: 'Start',
      chance: 100
    };
    this.getGuess = this.getGuess.bind(this);
  }

  checkGuess = () => {
    count++;

    if (+this.state.guess === this.state.randomNumber) {
      this.setState({
        chance: 'Win!'
      });
      count;
      this.endGame();
    } else if (count === 10) {
      this.setState({
        chance: '',
        attempts: ''
      });
      this.endGame();
    } else {
      this.setState({
        attempts: 10 - count,
        circleSize: this.state.circleSize - 5
      });
      if (+this.state.guess < this.state.randomNumber) {
        this.setState({
          chance: 'Low!'
        });
      } else if (+this.state.guess > this.state.randomNumber) {
        this.setState({
          chance: 'High!'
        });
      }
    }
  };

  getGuess = number =>
    this.setState({
      guess: number
    });

  startGame = () => {
    this.startTimer();
    this.setState({
      game: !this.state.game,
      attempts: 'Punch!',
      chance: '',
      randomNumber: randomNumber(),
      trueGame: this.state.trueGame + 1,
      lastGame: count === 10 ? 'Lost' : count - 1,
      circleSize: 100,
      timer: 15
    });
    count = 0;
  };

  endGame = () => {
    clearInterval(interval);
    interval = 15;

    this.setState(
      {
        game: !this.state.game,
        guess: '',
        speech:
          +this.state.guess === this.state.randomNumber ? 'YAPPY!' : 'OHHH!'
      },
      () => {
        setTimeout(() => {
          this.setState({
            speech: 'Again?'
          });
        }, 3000);
      }
    );

    setAsync('attempts', count === 10 ? count : count - 1);
    setAsync('gameNumber', this.state.trueGame);
  };

  startTimer = () => {
    interval = setInterval(this.tick, 1000);
  };

  tick = () => {
    if (this.state.timer !== 0) {
      this.setState({
        timer: this.state.timer - 1
      });
    } else {
      this.endGame();
    }
  };

  render() {
    // console.log(this.state.game, count);

    return (
      <KeyboardAvoidingView style={styles.body} behavior="padding">
        <View style={styles.header}>
          <LeftCircle lastGame={this.state.lastGame} />
          <RightCircle trueGame={this.state.trueGame} />
        </View>
        <View style={styles.main}>
          <View style={styles.mainHeader}>
            <Chance timer={this.state.timer} />
            <Attempts
              attempts={this.state.attempts}
              checkGuess={this.checkGuess}
              count={count}
              circleSize={this.state.circleSize}
              game={this.state.game}
            />
          </View>
          <View style={styles.circle}>
            {this.state.game ? (
              <InputGuess getGuess={this.getGuess} chance={this.state.chance} />
            ) : (
              <ButtonGame
                speech={this.state.speech}
                startGame={this.startGame}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 100
  },
  header: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 16
  },
  main: {
    backgroundColor: '#9B9B9B',
    alignSelf: 'center',
    height: 350,
    width: 350,
    borderRadius: 350,
    justifyContent: 'space-between'
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 32,
    marginTop: 16
  },
  circle: {
    height: 100,
    width: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignSelf: 'center',
    margin: 16,
    backgroundColor: '#fff'
  }
});