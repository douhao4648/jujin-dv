import zhCN from 'antd/lib/locale-provider/zh_CN';
import TableTest from './component/TableTest';

window._init_ = function(data) {
    var menus = data.menus;
    var userInfo = data.userInfo;
    var sites = data.sites;

    ReactDOM.render(<div style={{padding: 50,}} >
    	<TableTest></TableTest>
    </div>, document.getElementById('root'));
}