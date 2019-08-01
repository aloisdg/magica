import * as React from 'react'
import { Grid, Segment } from 'semantic-ui-react'
import { AbstractComponent } from '../common/component'
import { Command } from './command'
import { InputFiles } from './inputFiles'
import { Output } from './output'

export class Body extends AbstractComponent {
  render() {
    return (
      <Segment basic className="appBody" >
        <Grid>
          <Grid.Column floated='left' width={8}>
            <Command />
            <InputFiles />
          </Grid.Column>
          <Grid.Column floated='right' width={8}>
            <Output />
          </Grid.Column>
        </Grid>
      </Segment>)
  }
}
