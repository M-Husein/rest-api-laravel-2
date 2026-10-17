import type { MenuProps } from 'antd';
import { ConfigProvider, Dropdown, Button, Input, Empty, Slider, InputNumber } from "antd";
import { GrEdit, GrTrash, GrRotateRight } from "react-icons/gr";

export const Sider = ({
  data, 
  activeItem, 
  onClickDelete, 
  onChangeLabel, 
  onChangeAngleSlider,
  onChangeAngleInput, 
  onClickDone
}: any) => {
  return (
    <div className="p-4 h-full flex flex-col">
      {data ? 
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0 text-sm">Properties</h2>
            <Button  
              danger 
              icon={<GrTrash />} 
              onClick={onClickDelete} // () => handleDelete(selectedId)
            />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label htmlFor="lname">Label Name</label>
              <Input
                id="lname"
                className="mt-1"
                value={activeItem?.meta?.label}
                onChange={onChangeLabel}
                // onChange={(e) => {
                //   emit(value.map(v => v.id === selectedId ? { ...v, meta: { ...v.meta, label: e.target.value } } : v));
                // }}
              />
            </div>

            {activeItem?.type !== "point" && (
              <div className="flex items-center mb-2">
                <Slider
                  min={-180}
                  max={180}
                  className="grow mr-3"
                  value={activeItem?.angle ?? 0}
                  onChange={onChangeAngleSlider}
                  // onChange={(val) => {
                  //   emit(value.map(v => v.id === selectedId ? { ...v, angle: val } : v));
                  // }}
                  tooltip={{ formatter: val => val + "°" }}
                />
                <InputNumber
                  style={{ width: 73 }} // 69 = small
                  min={-360}
                  max={360}
                  step={1}
                  formatter={val => val + "°"}
                  parser={(value) => +(value?.replace('°', '') || 0)}
                  value={activeItem?.angle != null ? Math.round(activeItem.angle) : 0}
                  onChange={onChangeAngleInput}
                  // onChange={(val) => {
                  //   emit(value.map(v => v.id === selectedId ? { ...v, angle: val ?? 0 } : v));
                  // }}
                />
              </div>
            )}

            <div className="mt-auto">
              <Button 
                block 
                type="primary" 
                onClick={onClickDone}
                // onClick={() => setSelectedId('')}
              >
                Done Editing
              </Button>
            </div>
          </div>
        </>
        : 
        <Empty description="Select an item" />
      }
    </div>
  );
}

const menuItems: MenuProps['items'] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: <GrEdit />, // <b className="mr-1">✏️</b>
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: <GrTrash />, // <b className="mr-1">🗑️</b>
  },
];

export const ContextMenu = ({
  menu, 
  onClick, 
  onOpenChange, 
}: any) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Dropdown: {
            motion: false,
            motionDurationMid: '0s', // Set motion duration to zero
          },
        },
      }}
    >
      <Dropdown
        trigger={['contextMenu']}
        menu={{
          items: menuItems,
          onClick // : handleMenuClick
        }}
        open={!!menu} // menuConfig
        onOpenChange={onOpenChange} // (open) => !open && setMenuConfig(null)
      >
        <div 
          style={{ 
            position: 'fixed', 
            left: menu?.x, 
            top: menu?.y, 
            width: 1, 
            height: 1 
          }} 
        />
      </Dropdown>
    </ConfigProvider>
  );
}

export const RotateHandle = ({
  dims, 
  activeItem, 
  onPointerDown, 
  onPointerUp, 
}: any) => {
  if(dims && activeItem && activeItem.type === 'rect'){
    return (
      <div 
        className="absolute pointer-events-none"
        style={{
          left: `${activeItem.x * 100}%`,
          top: `${activeItem.y * 100}%`,
          width: `${activeItem.w ? activeItem.w * 100 : 0}%`,
          height: `${activeItem.h ? activeItem.h * 100 : 0}%`,
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            transform: `rotate(${activeItem.angle || 0}deg)`,
            transformOrigin: 'center center'
          }}
        >
          {/* <div 
            className="relative -top-12 pointer-events-auto"
            // onPointerDown={startResize(a, handle)} 
            onPointerDown={onPointerDown} // (e) => handleRotateStart(e, activeItem, dims)
            onPointerUp={onPointerUp} // handlePointerUpOnHandle
          > */}
            <div 
              className="absolute -top-12 right-0 pointer-events-auto w-8 h-8 bg-white rounded-full shadow flex items-center justify-center cursor-alias hover_bg-blue-50"
              onPointerDown={onPointerDown} // (e) => handleRotateStart(e, activeItem, dims)
              onPointerUp={onPointerUp} // handlePointerUpOnHandle
            >
              <GrRotateRight className="text-blue-500 text-sm" />
            </div>
          {/* </div> */}
        </div>
        {/* <div className="m-auto bg-gray-900/80 text-white px-2.5 py-0.5 rounded-full text-13 shadow border border-gray-700 whitespace-nowrap">
          {Math.round(activeItem.angle || 0)}°
        </div> */}
      </div>
    );
  }
  return null;
}
