import { CorePluginList } from '@core/plugins/plugin.list';
import { ActionPlugin } from '@common/pattern/plugin/action.plugin';
import MapContainer from '@common/pattern/batch-processing/common/container';

export class CorePluginContainer extends MapContainer {
  initialize(): Map<CorePluginList, ActionPlugin> {
    return new Map<CorePluginList, ActionPlugin>();
  }
}
