import fs from 'fs';
import path from 'path';
import { Action } from '@common/pattern/batch-processing/common/action';
import { logger } from '@common/logger/winston.logger';
import ActionContainer from '@common/pattern/batch-processing/common/container';
import DataProcessingAction from '@core/actions/data-processing';

export class CoreActionContainer extends ActionContainer {
  constructor() {
    super();
  }

  public async init(): Promise<void> {
    this.registerAction(DataProcessingAction);
  }

  public async dynamicInit(): Promise<void> {
    const actionsDir = path.join(__dirname, './');
    const files = fs.readdirSync(actionsDir);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const modulePath = path.join(actionsDir, file);
        const actionModule = await import(modulePath);

        const action: Action = actionModule.default;
        if (action && action.name) {
          this.registerAction(action);
          logger.info(`Action ${action.name} registered successfully.`);
        }
      }
    }
  }
}
