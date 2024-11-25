"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

const GAME_HEIGHT = 400
const GAME_WIDTH = 1000
const GRAVITY = 0.15
const JUMP_HEIGHT = 150
const INITIAL_JUMP_VELOCITY = 10
const SPEED_INCREASE_RATE = 0.001
const INITIAL_SPEED = 5

const Dinosaur = ({ y }: { y: number }) => (
  <Image src="/dinosaur.png" alt="Dinosaur" style={{ position: 'absolute', left: 10, top: y, width: 40, height: 40 }} />
)

const Cactus = ({ x }: { x: number }) => (
  <Image src="/cactus.png" alt="Cactus" style={{ position: 'absolute', left: x, top: GAME_HEIGHT - 40, width: 20, height: 40 }} />
)

const Cloud = ({ x, y }: { x: number; y: number }) => (
  <Image src="/cloud.png" alt="Cloud" style={{ position: 'absolute', left: x, top: y, width: 60, height: 30 }} width={60} height={30} />
)

export default function DinosaurGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [dinoY, setDinoY] = useState(GAME_HEIGHT - 40)
  const [jumping, setJumping] = useState(false)
  const [jumpVelocity, setJumpVelocity] = useState(0)
  const [cacti, setCacti] = useState<number[]>([])
  const [clouds, setClouds] = useState<{ x: number; y: number }[]>([])
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [jumpCount, setJumpCount] = useState(0)

  const gameLoopRef = useRef<number>()
  const lastUpdateTimeRef = useRef(0)

  const jump = useCallback(() => {
    if (!gameOver && jumpCount < 2) {
      setJumping(true)
      setJumpVelocity(INITIAL_JUMP_VELOCITY)
      setJumpCount((prevCount) => prevCount + 1)
    }
  }, [gameOver, jumpCount])

  const resetGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setDinoY(GAME_HEIGHT - 40)
    setJumping(false)
    setJumpVelocity(0)
    setCacti([GAME_WIDTH])
    setClouds([{ x: GAME_WIDTH, y: Math.random() * 50 }])
    setSpeed(INITIAL_SPEED)
    lastUpdateTimeRef.current = performance.now()
  }, [])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      if (gameOver) {
        resetGame()
      } else {
        jump()
      }
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space' && jumping) {
      setJumpVelocity((prevVelocity) => Math.min(prevVelocity + 5, 20))
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [jump, gameOver, resetGame, handleKeyDown, handleKeyUp])

  useEffect(() => {
    if (!gameStarted || gameOver) return // Stop game loop if game is over

    const gameLoop = (currentTime: number) => {
      lastUpdateTimeRef.current = currentTime

      // Update dinosaur position
      if (jumping) {
        setDinoY((prevY) => {
          const newY = prevY - jumpVelocity
          setJumpVelocity((prevVelocity) => prevVelocity - GRAVITY)

          // Check if the dinosaur has reached the ground
          if (newY >= GAME_HEIGHT - 40) {
            setJumping(false)
            setJumpCount(0) // Reset jump count when on the ground
            return GAME_HEIGHT - 40
          }

          // Ensure the dinosaur does not jump higher than JUMP_HEIGHT
          if (newY <= GAME_HEIGHT - 40 - JUMP_HEIGHT) {
            return GAME_HEIGHT - 40 - JUMP_HEIGHT
          }

          return newY
        })
      }

      // Update cacti positions
      setCacti((prevCacti) => {
        const newCacti = prevCacti.map((x) => x - speed).filter((x) => x > -20)
        if (newCacti.length < 3 && Math.random() < 0.02) {
          newCacti.push(GAME_WIDTH)
        }
        return newCacti
      })

      // Update cloud positions
      setClouds((prevClouds) => {
        const newClouds = prevClouds
          .map((cloud) => ({ ...cloud, x: cloud.x - speed * 0.5 }))
          .filter((cloud) => cloud.x > -60)
        if (newClouds.length < 3 && Math.random() < 0.005) {
          newClouds.push({ x: GAME_WIDTH, y: Math.random() * 50 })
        }
        return newClouds
      })

      // Check for collisions
      const dinoHitbox = { x: 10, y: dinoY, width: 40, height: 40 }
      for (const cactusX of cacti) {
        const cactusHitbox = { x: cactusX, y: GAME_HEIGHT - 40, width: 20, height: 40 }
        if (
          dinoHitbox.x < cactusHitbox.x + cactusHitbox.width &&
          dinoHitbox.x + dinoHitbox.width > cactusHitbox.x &&
          dinoHitbox.y < cactusHitbox.y + cactusHitbox.height &&
          dinoHitbox.y + dinoHitbox.height > cactusHitbox.y
        ) {
          setGameOver(true)
          setHighScore((prevHighScore) => Math.max(prevHighScore, score))
          return
        }
      }

      // Update score and speed
      setScore((prevScore) => prevScore + 1)
      setSpeed((prevSpeed) => prevSpeed + SPEED_INCREASE_RATE)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, jumping, dinoY, cacti, jumpVelocity, speed, score])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-10">The Famous Dinosaur Game</h1>
      <div className="relative w-[1000px] h-[400px] bg-white border-2 border-gray-300 overflow-hidden">
        {clouds.map((cloud, index) => (
          <Cloud key={index} x={cloud.x} y={cloud.y} />
        ))}
        <Dinosaur y={dinoY} />
        {cacti.map((x, index) => (
          <Cactus key={index} x={x} />
        ))}
        <svg width={GAME_WIDTH} height={GAME_HEIGHT}>
          <line x1="0" y1={GAME_HEIGHT} x2={GAME_WIDTH} y2={GAME_HEIGHT} stroke="currentColor" strokeWidth="2" />
        </svg>
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={resetGame}
            >
              Start Game
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">Game Over</h2>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-xl font-bold">
        Score: {score} | High Score: {highScore}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Press spacebar to jump
      </div>
      <footer className="mt-8 text-sm text-gray-500">
      </footer>
    </div>
  )
}

