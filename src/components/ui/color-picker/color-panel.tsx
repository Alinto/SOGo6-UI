'use client'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import ColorPicker from './custom-view'
import PresetView from './preset-view'

interface ColorPanelProps {
  setColor: (color: string) => void
}

const ColorPanel: React.FC<ColorPanelProps> = ({ setColor }) => {
  return (
    <>
      <Tabs defaultValue="preset">
        <TabsList className="flex justify-center items-center">
          <TabsTrigger value="preset">Preset</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent key="preset" value="preset">
            <motion.div
              key={'preset'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            >
              <PresetView setColor={setColor} />
            </motion.div>
          </TabsContent>
          <TabsContent key="custom" value="custom">
            <motion.div
              key={'custom'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0.3 }}
            >
              <ColorPicker defaultValue="#101010" onChange={setColor} />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </>
  )
}

export default ColorPanel
