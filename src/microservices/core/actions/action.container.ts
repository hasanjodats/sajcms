import ActionContainer from '@common/pattern/batch-processing/common/container';
import DataProcessingAction from './data-processing';

export class CoreActionContainer extends ActionContainer {
  constructor() {
    super();
    this.registerAction(DataProcessingAction);
  }
}
