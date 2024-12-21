import ActionContainer from '@common/pattern/batch-processing/common/container';
import DataProcessingAction from '@core/actions/data-processing';

export class CoreActionContainer extends ActionContainer {
  constructor() {
    super();
  }

  public async init(): Promise<void> {
    this.registerAction(DataProcessingAction);
  }
}
