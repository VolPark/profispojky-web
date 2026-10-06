import React from 'react'

import { HomeMotion } from './home/HomeMotion'

/**
 * Pohyb stránky (reveal, rozsvěcení, napočítání, vykreslení ilustrací) – stejný na úvodní stránce i podstránkách.
 * Skript zapne třídu `motion` ještě před vykreslením, ať obsah při načtení neproblikne.
 */
export const MotionLayer = () => (
  <>
    <script
      dangerouslySetInnerHTML={{
        __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')",
      }}
    />
    <HomeMotion />
  </>
)
