import React from 'react'
import { VCard } from '../../address-books-types'
import { isDistributionList } from '../../utils/distribution-list'
import ContactVisualization from './contact-visualization'
import DistributionListVisualization from './distribution-list-visualization'

interface VisualizationProps {
  data: VCard
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  if (isDistributionList(data)) {
    return <DistributionListVisualization data={data} />
  }

  return <ContactVisualization data={data} />
}

export default Visualization
