import React from "react";
import PropTypes from 'prop-types';
import styled from 'styled-components';

export function LinkImage({ src, width, maxWidth, link }) {
  return (
    <a href={link}>
      <Link
        src={src}
        width={width}
        maxWidth={maxWidth}
        alt=""
        data-testid="img-link-test-id"
      />
    </a>
  );
}

const Link = styled.img`
  width: ${props => props.width};
  max-width: ${props => props.maxWidth};
  display:  block;
  margin: 20px auto;
`;

LinkImage.propTypes = {
  src: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  maxWidth: PropTypes.string
}