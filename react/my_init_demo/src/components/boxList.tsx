import  React, {FC, memo} from 'react';
import {Empty} from 'antd';
import style from '../style/boxList.module.less';
import {TBox} from '../types/box';

interface IProps {
    list: TBox[];
    loading?: boolean;
}

const BoxList: FC<IProps> = props => {
    const {list, loading} = props;

    return (
        <div>
            <>{!loading ? <p className={style['loading-styl']}>加载中...</p> : ''}</>
            <>{list.length === 0 && !loading ? <Empty/> : ''}</>
        </div>
    );
};

export default memo(BoxList);