
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import ReactMarkdown from "react-markdown";
import styled from 'styled-components';
import BarChart from '../components/chart/Bar';
import { useFetch } from '../components/utils/hooks';
import { LinkImage } from '../components/images/Image';
import { barInfo } from '../components/text';
import bbcChart from '../assets/bbc.png';
import loadingSvg from '../assets/loading.svg';

export default function Demo() {
  const [loading, setLoading] = useState(false);
  const barData = useFetch("https://pomber.github.io/covid19/timeseries.json", {});

  useEffect(() => {
    if (!Object.keys(barData).length) {
      setLoading(true);
      return;
    } else {
      setLoading(false);
    }
  }, [barData])

  return (
    <Charts>
      <Loading
        src={loadingSvg}
        alt=''
        style={{ opacity: loading ? 1 : 0 }}
      />
      <BarChart barData={barData} />
      <UpdatedReactMarkdown source={barInfo} escapeHtml={false} />
      <LinkImage src={bbcChart} width="600px" maxWidth="90%"
        link="https://www.bbc.co.uk/news/world-51235105" />
    </Charts>
  );
}

const UpdatedReactMarkdown = styled(ReactMarkdown)`
  margin: 30px auto 40px;
  width: 700px;

  @media(max-width: 700px){
    width: 95%;
  }
`;

const Charts = styled.div`
  margin: 0 auto;

  a:link {
    color: #4fafc0;
  }
  
  a:visited {
    color: #359987;
  }
`

const Loading = styled.img`
  display: block;
  margin: 0 auto;
  width: 100px;
  z-index: 3;
  background-repeat: no-repeat;
`;


Demo.propTypes = {
  src: PropTypes.string,
  barData: PropTypes.object,
  source: PropTypes.string,
  link: PropTypes.string
}