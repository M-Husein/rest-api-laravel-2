import { useState } from "react";
import { useCustomMutation, useNotification, useInvalidate } from "@refinedev/core"; // useGetIdentity, 
import { Button, Image, Popconfirm, Upload } from "antd";
import { DeleteOutlined } from "@ant-design/icons"; // EyeOutlined
import type { UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { httpRequest } from "@/providers/dataProvider";
import { getAvatarUrl, updateUser } from '@/utils/user';

// const makeFileItem = (avatar: string): UploadFile => ({
//   uid: Date.now() + '', // .toString()
//   name: avatar,
//   status: 'done',
//   url: getAvatarUrl(avatar) ?? ''
// });

const makeFileItem = (avatar: string): UploadFile => ({
  uid: `${avatar}`,
  name: avatar,
  status: 'done',
  url: getAvatarUrl(avatar) ?? '',
});

export const AvatarSection = ({ identity, refetch }: any) => {
  // const { data: identity, refetch } = useGetIdentity<any>();
  const { open } = useNotification();
  const invalidate = useInvalidate();
  // Lazy initializer covers mount-with-data (identity often cached by refine,
  // so avatar is already present on first render).
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    identity?.avatar ? [makeFileItem(identity.avatar)] : [],
  );
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { mutate: deleteMutate } = useCustomMutation();

  // Sync the file list when the identity avatar arrives late or changes
  // (upload/delete/refetch). State is adjusted during render (React's
  // recommended "derived state" pattern) instead of in an effect,
  // avoiding cascading renders.
  const [prevAvatar, setPrevAvatar] = useState(identity?.avatar);
  if (identity?.avatar !== prevAvatar) {
    setPrevAvatar(identity?.avatar);
    setFileList(identity?.avatar ? [makeFileItem(identity.avatar)] : []);
  }

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Keep only latest file to prevent appending
    setFileList(newFileList.slice(-1));
  };

  const customRequest: UploadProps['customRequest'] = async ({
    file,
    onSuccess,
    onError
  }) => {
    try{
      const formData = new FormData();
      formData.append('avatar', file as Blob);

      const response: any = await httpRequest.post('me/avatar', {
        body: formData
      }).json();

      if(response?.success){
        onSuccess?.(response);

        // // Set new avatar directly from response — no need to wait for refetch
        // const newAvatar = response?.data?.avatar;
        // if(newAvatar){
        //   setFileList([makeFileItem(newAvatar)]);
        // }

        open?.({ type: 'success', message: response.message || 'Avatar updated.' });
        invalidate({ resource: 'me', invalidates: ['detail'] });
        updateUser({ 
          avatar: response.data?.avatar || response.data || URL.createObjectURL(file as Blob)
        });
        refetch();
      }else{
        throw new Error(response?.message || 'Upload failed.');
      }
    }catch(err: any){
      onError?.(err);
      open?.({ type: 'error', message: err?.message || 'Failed to upload avatar.' });
    }
  };

  const handleDelete = () => {
    setDeleting(true);
    deleteMutate(
      {
        url: 'me/avatar',
        method: 'delete',
        values: {}
      },
      {
        onSuccess: (res: any) => {
          open?.({ type: 'success', message: res?.message || 'Avatar removed.' });
          invalidate({ resource: 'me', invalidates: ['detail'] });
          setFileList([]);
          updateUser({ avatar: null });
          refetch();
        },
        onError: (err: any) => {
          open?.({ type: 'error', message: err?.message || 'Failed to remove avatar.' });
        },
        onSettled: () => setDeleting(false)
      }
    );
  };

  const doneFile = fileList.find(file => file.status === 'done');
  const hasAvatar = !!doneFile;

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {doneFile?.url && (
        <Image
          hidden
          src={doneFile.url}
          preview={{
            open: previewOpen,
            src: doneFile.url,
            onOpenChange: setPreviewOpen
          }}
        />
      )}

      <ImgCrop
        rotationSlider
        aspectSlider
        showReset
        aspect={1}
        quality={0.9}
        modalTitle="Crop Avatar"
        // modalOk="Apply"
        // modalCancel="Cancel"
      >
        <Upload
          pastable
          listType="picture-card"
          fileList={fileList}
          onChange={handleChange}
          customRequest={customRequest}
          accept="image/jpeg,image/png,image/webp,image/gif"
          showUploadList={{
            showRemoveIcon: false,
            showPreviewIcon: hasAvatar,
            // previewIcon: <EyeOutlined />
          }}
          onPreview={() => setPreviewOpen(true)}
        >
          <div className="flex flex-col items-center text-2xl">
            <b>+</b>
            <div className="text-xs">
              {hasAvatar ? 'Change' : 'Upload'}
            </div>
          </div>
        </Upload>
      </ImgCrop>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          JPG, PNG, WebP or GIF · Max 2MB
        </p>
        {/* <p className="text-xs text-gray-400 mt-1">
          Image will be cropped to square
        </p> */}
      </div>

      {hasAvatar && (
        <Popconfirm
          title="Remove avatar?"
          description="Your profile will show a default avatar."
          onConfirm={handleDelete}
          okText="Remove"
          // okButtonProps={{ danger: true }}
        >
          <Button
            danger
            size="large"
            icon={<DeleteOutlined />}
            loading={deleting}
          >
            Remove Avatar
          </Button>
        </Popconfirm>
      )}
    </div>
  );
};
