// import { useEffect } from "react";
import { useDocumentTitle } from "@/utils/hooks/useDocumentTitle"; // "@refinedev/react-router"
import { HttpError, useList } from "@refinedev/core";
import { Card } from 'antd'; // , Button
import { useTranslation } from 'react-i18next';

const parseLink = (type: string) => {
  switch(type){
    case 'email':
      return 'mailto:';
    case 'phone':
      return 'tel:+';
    case 'sms':
      return 'sms:+';
    default:
      return '';
  }
};

interface IContacts {
  id: number | string;
  label: string;
  value: string;
  type: string;
  icon: string;
  sort: number | string;
}

export default function Page(){
  const ns = "contact-us";
  const { t } = useTranslation([ns]);

  const titlePage = t('title', ns); // , "Contact Us"
  useDocumentTitle(titlePage + " • " + APP.name);

  const {
    result: dataContacts,
    query,
  } = useList<IContacts, HttpError>({
    resource: "contacts?sort=sort",
    pagination: {
      mode: "off"
    },
    // sorters: [
    //   {
    //     field: "sort",
    //     order: "asc",
    //   },
    // ],
  });

  // console.log('dataContacts:', dataContacts);

  // const contacts = (dataContacts?.data || []); // .toSorted();

  return (
    <div className="py-4 px-2 max-w-screen-xl mx-auto">
      <Card 
        title={titlePage}
        className="shadow"
        loading={query.isLoading || query.isFetching}
      >
        <p>{t('desc')}</p>
        <nav>
          {(dataContacts?.data || []).map(item =>
            <a
              key={item.id}
              title={item.label}
              href={parseLink(item.type) + item.value}
              target={!item.type || item.type === "link" ? "_blank" : void 0}
              rel="noopener noreferrer"
              className="flex flex-col"
            >
              {item.icon && <img src={item.icon} alt={item.label} loading="lazy" />}
              {item.value}
            </a>
          )}
        </nav>
      </Card>
    </div>
  );
}
