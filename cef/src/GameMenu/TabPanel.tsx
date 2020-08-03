import React from 'react'
import Box from '@material-ui/core/Box'

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

/**
 * Tab panel component
 * @param {TabPanelProps} props 
 */
export default function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gamemenu-tabpanel-${index}`}
      aria-labelledby={`gamemenu-tab-${index}`}
    >
      {value === index && (
        <Box p={3}>{children}</Box>
      )}
    </div>
  )
}