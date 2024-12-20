import { CoreActionList } from '@core/actions/action.list';
import { Action } from '@common/pattern/batch-processing/common/action';
import MapContainer from '@common/pattern/batch-processing/common/container';

export class CoreActionContainer extends MapContainer {
  initialize(): Map<CoreActionList, Action> {
    return new Map<CoreActionList, Action>();
  }
}
