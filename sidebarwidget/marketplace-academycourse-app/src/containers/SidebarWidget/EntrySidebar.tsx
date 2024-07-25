import "./styles.scss";

import {
  Dropdown,
  Field,
  FieldLabel,
  SkeletonTile,
} from "@contentstack/venus-components";
import { useEffect, useState } from "react";

import ContentstackAppSdk from "@contentstack/app-sdk";
import Icon from "../../assets/sidebarwidget.svg";
import localeTexts from "../../common/locales/en-us/index";
import parse from "html-react-parser";

const EntrySidebarExtension = () => {
  const [state, setState] = useState<any>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const [loading, setLoading] = useState(true);
  const [entryData, setEntryData] = useState<any>({});
  const [fieldList, setFieldList] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);

  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        const config = await appSdk?.getConfig();
        const data = await appSdk?.location?.SidebarWidget?.entry?.getData();

        setEntryData(data);
        console.log(data);
        const { uid } = data;
        console.log(uid);
        const response = await fetch(
          `http://localhost:3000/entry?uid=${uid}`
        );
        console.log(response.json());
        setState({
          config,
          location: appSdk?.location,
          appSdkInitialized: true,
        });
      })
      .catch((error) => {
        console.error("appSdk initialization error", error);
      });
  }, []);

  // const renderSidebarContent = () => {
  //   if (loading)
  //     return (
  //       <div className="sidebar-center">
  //         <SkeletonTile
  //           numberOfTiles={1}
  //           tileBottomSpace={20}
  //           tileHeight={20}
  //           tileRadius={10}
  //           tileTopSpace={20}
  //           tileWidth={200}
  //           tileleftSpace={0}
  //         />
  //       </div>
  //     );
  //   return (
  //     <>

  //     </>
  //   );
  // };
  return (
    <div className="sidebar">
      <h3>{state?.config?.title}</h3>
      {/* {renderSidebarContent()} */}
    </div>
  );
};

export default EntrySidebarExtension;
